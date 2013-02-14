var $         = require("jquery-browserify");

$(document).ready(function() {

  //Create viewer
  var viewer = require("gl-shells").makeViewer();
  
  //Create a volume
  function sphere_dist(x) {
    return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
  }
  var volume = require("rle-sample").dense([-6,-6,-6], [7,7,7], function(x) {
    if(sphere_dist(x) < 0) {
      return 1;
    }
    return 0;
  }, sphere_dist);
  
  viewer.updateMesh(require("../../index.js")(volume));
  
});