"use strict"; "use restrict";

//Import stuff from misc.js
var rle       = require("rle-core");
var stencils  = require("rle-stencils");

var NEGATIVE_INFINITY     = rle.NEGATIVE_INFINITY
  , POSITIVE_INFINITY     = rle.POSITIVE_INFINITY
  , EPSILON               = rle.EPSILON
  , CUBE_STENCIL          = stencils.CUBE_STENCIL
  , compareCoord          = rle.compareCoord
  , beginStencil          = rle.beginStencil;

var CUBE_EDGE0 = new Int32Array([ 6, 5, 3, 0, 0, 0, 1, 1, 2, 2, 4, 4 ]);
var CUBE_EDGE1 = new Int32Array([ 7, 7, 7, 1, 2, 4, 3, 5, 3, 6, 5, 6 ]);
var CUBE_EDGED = new Int32Array([ 0, 1, 2, 0, 1, 2, 1, 2, 0, 2, 0, 1 ]);

//List of 12-bit masks describing edge crossings
var EDGE_TABLE = new Int16Array(256);
(function() {
  //Precalculate edge crossings
  for(var mask=0; mask<256; ++mask) {
    var e_mask = 0;
    for(var i=0; i<12; ++i) {
      var e0 = CUBE_EDGE0[i]
        , e1 = CUBE_EDGE1[i];
      if(!(mask & (1<<e0)) !== !(mask & (1<<e1))) {
        e_mask |= (1<<i);
      }
      EDGE_TABLE[mask] = e_mask;
    }
  }
})();

//Create default solid func
var DEFAULT_SOLID_FUNC = new Function("phase", "return !!phase;");

//Extracts a surface from the volume using elastic surface nets
function createNarrowbandMesh(volume, lo_, hi_, solid_func) {
  //Handle missing parameters
  var lo, hi;
  if(!lo_) {
    lo = new Int32Array(3);
    lo[0] = lo[1] = lo[2] = NEGATIVE_INFINITY;
  } else {
    lo = new Int32Array(lo_);
  }
  if(!hi_) {
    hi = new Int32Array(3);
    hi[0] = hi[1] = hi[2] = POSITIVE_INFINITY;
  } else {
    hi = new Int32Array(hi_);
  }
  if(!solid_func) {
    solid_func = DEFAULT_SOLID_FUNC;
  }
  //Locals
  var positions   = []
    , faces       = []
    , phases      = []
    , vdistances  = volume.distances
    , vphases     = volume.phases
    , cdistances  = new Float64Array(8)   //Distances at iterator
    , cphases     = new Int32Array(8)     //Phases at iterator
    , v_ptr       = new Int32Array(8);
  //Get initial iterator
  var iter = beginStencil(volume, CUBE_STENCIL);
  iter.seek(lo);
main_loop:
  for(; iter.hasNext(); iter.next()) {
    //Skip coordinates outside range
    var coord = iter.coord;
    //Exit if we are out of bounds
    if(compareCoord(hi, coord) <= 0) {
      break;
    }
    //Skip coordinates outside bounds
    for(var i=0; i<3; ++i) {
      if(coord[i] < lo[i] || coord[i] >= hi[i]) {
        continue main_loop;
      }
    }
    //Read in values and compute mask
    var ptrs = iter.ptrs
      , mask = 0;
    for(var i=0; i<8; ++i) {
      var ptr       = ptrs[i];
      cdistances[i] = vdistances[ptr];
      var phase     = vphases[ptr];
      cphases[i]    = phase;
      mask         |= solid_func(vphases[ptrs[i]]) ? 0 : (1 << i);
    }
    if(mask === 0 || mask === 0xff) {
      continue;
    }
    //Compute centroid
    var crossings = EDGE_TABLE[mask]
      , centroid  = [0,0,0]
      , count     = 0;
    for(var i=0; i < 12; ++i) {
      if((crossings & (1<<i)) === 0) {
        continue;
      }
      var eu    = CUBE_EDGE0[i]
        , ev    = CUBE_EDGE1[i]
        , d     = CUBE_EDGED[i]
        , u     = cdistances[eu]
        , v     = cdistances[ev];
      for(var j=0; j<3; ++j) {
        if(eu & (1<<j)) {
          centroid[j] -= 1.0-EPSILON;
        }
      }
      centroid[d] -= Math.min(1.0-EPSILON,Math.max(EPSILON, u / (u + v)));
      ++count;
    }
    //Compute vertex
    var weight  = 1.0 / count;
    for(var i=0; i<3; ++i) {
      centroid[i] = coord[i] + centroid[i] * weight;
    }
    //Append vertex
    positions.push(centroid);
    //Advance vertex pointers
outer_loop:
    for(var i=0; i<8; ++i) {
      while(true) {
        if(v_ptr[i] >= positions.length-1) {
          continue outer_loop;
        }
        var p = positions[v_ptr[i]+1];
        for(var j=2; j>=0; --j) {
          var s = (Math.ceil(p[j])|0) - coord[j] + ((i&(1<<j)) ? 1 : 0);
          if(s) {
            break;
          }
        }
        if(s <=0) {
          ++v_ptr[i];
        }
        if(s >= 0) {
          break;
        }
      }
    }
    //Check if face in bounds
    for(var i=0; i<3; ++i) {
      if(coord[i] <= lo[i]) {
        continue main_loop;
      }
    }
    //Add faces
    var phase0 = cphases[7];
    for(var i=0; i<3; ++i) {
      if(!(crossings & (1<<i))) {
        continue;
      }
      var phase1 = cphases[7^(1<<i)]
        , iu = 1<<((i+1)%3)
        , iv = 1<<((i+2)%3);
      if(mask & 128) {
        phases.push([phase1, phase0]);
        phases.push([phase1, phase0]);
        faces.push([v_ptr[0],  v_ptr[iu], v_ptr[iv]]);
        faces.push([v_ptr[iv], v_ptr[iu], v_ptr[iu+iv]]);
      } else {
        phases.push([phase0, phase1]);
        phases.push([phase0, phase1]);
        faces.push([v_ptr[0],  v_ptr[iv], v_ptr[iu]]);
        faces.push([v_ptr[iu], v_ptr[iv], v_ptr[iu+iv]]);
      }
    }
  }
  return {
    positions:  positions,
    cells:      faces,
    phases:     phases
  };
}
module.exports = createNarrowbandMesh;
