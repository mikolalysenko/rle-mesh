rle-mesh
========
Mesh and surface extraction routines for narrow band level sets.

Usage
=====
Just call module.exports to pull out a mesh from the volume

    //Create a volume
    function sphere_dist(x) {
      return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
    }
    var volume = require("rle-core").sample([-6,-6,-6], [7,7,7], function(x) {
      if(sphere_dist(x) < 0) {
        return 1;
      }
      return 0;
    }, sphere_dist);
    
    //Create the mesh
    var mesh = require("rle-mesh")(volume);

Installation
============
Via npm:

    npm install rle-mesh

`require("rle-mesh")(volume[, lo, hi, solid_func])`
===================================================
The main meshing method takes the following parameters:

* `volume`: An RLE volume
* `lo`: (Optional) Lower bounds on the volume to extract
* `hi`: (Optional) Upper bounds on the volume to extract
* `solid_func`: (Optional) A predicate that determines whether or not to display a voxel phase

Returns: An object with the following properties
* `positions`: An array of length 3 arrays representing the position of each vertex.
* `faces`: An array of length 3 arrays representing the indexed faces of the mesh
* `phases`: An array of length 2 arrays the same length as `faces` that has the phase on the front and back of each face.

Credits
=======
(c) 2013 Mikola Lysenko

