var rle     = require("rle-core");
var mesh    = require("../index.js");

//Create a volume
function sphere_dist(x) {
  return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 50;
}

var volume = rle.sample([-100,-100,-100], [100,100,100], function(x) {
  if(sphere_dist(x) < 0) {
    return 1;
  }
  return 0;
}, sphere_dist);

console.log("Starting benchmark");
var start = Date.now();
for(var i=0; i<100; ++i) {
  mesh(volume);
}
console.log((Date.now())- start);