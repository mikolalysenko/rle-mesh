rle-mesh
========
Mesh and surface extraction routines for narrow band level sets.  It is part of the [rle family of modules](https://github.com/mikolalysenko/rle-core).

Installation
============
Via npm:

    npm install rle-mesh

Example
=======
Here is how you can create a mesh for a solid object:

    var volume = require("rle-sample").solid.dense([-6,-6,-6], [7,7,7], function(x) {
      return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
    });
    var mesh = require("rle-mesh")(volume);

This creates a mesh that looks like this:

<img src="https://raw.github.com/mikolalysenko/rle-mesh/master/images/solid.png" width=40%>

[You can also view the demo in your browser here](http://mikolalysenko.github.com/rle-mesh/examples/simple/www/index.html)

rle-mesh can also handle multiphase level sets too.  Here is a more complicated example:

    function sphere_dist(x) {
      return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
    }
    var volume = require("rle-sample").dense([-6,-6,-6], [7,7,7], function(x) {
      if(sphere_dist(x) < 0) {
        if(x[0] < 0) {
          return 1;
        }
        return 2;
      }
      return 0;
    }, sphere_dist);
    var mesh = require("rle-mesh")(volume);

This creates a sphere with two distinct phases:

![](https://raw.github.com/mikolalysenko/rle-mesh/master/images/multi.png)

[Again, you can also look at the result in 3D using your web browser.](http://mikolalysenko.github.com/rle-mesh/examples/simpleMultiphase/www/index.html)

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
