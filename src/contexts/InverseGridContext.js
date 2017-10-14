"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module InverseGridContext
 */

var babylon = require("babylonjs");
var hexToRgb = require("../HexToRGB.js");
/**
 * This context (item factory + manager) creates a visible grid for the board.
 * This particular grid is composed of semi-transparent hexagons.
 * Instead of inifinitely tiling the plain, only a finite number are shown that fade in and out as the view moves
 * @constructor
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function InverseGridContext(hexDimensions, board, color) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof InverseGridContext)) {
    return new InverseGridContext(hexDimensions, board, color);
  }
  var context = this;
  context.hexDimensions = hexDimensions;
  this.board = board;
  this.scene = board.scene;
  this.color = hexToRgb(color);

  let positionArray = createPositionArray(hexDimensions);

  var nb = positionArray.length; // nb of hexagons
  // custom position function for SPS creation
  var myPositionFunction = (particle, i) => {
    particle.position.x = positionArray[i].x; //(Math.random() - 0.5) * fact;
    particle.position.y = positionArray[i].y; //(Math.random() - 0.5) * fact;
    particle.position.z = 0; //(Math.random() - 0.5) * fact;
    //particle.rotation.x = Math.random() * 3.15;
    //particle.rotation.y = Math.random() * 3.15;
    particle.rotation.z = Math.PI / 2;
    particle.color = new babylon.Color4(
      this.color.r / 256,
      this.color.g / 256,
      this.color.b / 256,
      0.5
    );
  };

  var hexagon = babylon.MeshBuilder.CreateDisc(
    "t",
    {
      radius: hexDimensions.hexagon_half_wide_width - 2,
      tessellation: 6,
      sideOrientation: babylon.Mesh.DOUBLESIDE
    },
    this.scene
  );

  // SPS creation : Immutable {updatable: false}
  var SPS = new babylon.SolidParticleSystem("SPS", this.scene, {
    updatable: false,
    pickable: false
  });
  SPS.addShape(hexagon, nb, { positionFunction: myPositionFunction });
  var mesh = SPS.buildMesh();
  mesh.hasVertexAlpha = true;
  hexagon.rotation.z = Math.PI / 2;
  hexagon.color = new babylon.Color4(
    this.color.r / 256,
    this.color.g / 256,
    this.color.b / 256,
    0.5
  );
  this.gridParent = mesh;
  hexagon.dispose();
  this.board.addListener("pan", e => {
    //Convert the middle point to U, V
    var hexCoordinates = this.hexDimensions.getReferencePoint(
      e.middleX,
      e.middleY
    );

    //Find the center of the hex in cartesian co-ordinates
    var centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(
      hexCoordinates.u,
      hexCoordinates.v
    );

    //Center our grid there
    context.gridParent.position.x = centerHexPixelCoordinates.x;
    context.gridParent.position.y = centerHexPixelCoordinates.y;
  });
};

/**
 * Creates a full grid from the single mesh
 * @private
 */
var createPositionArray = function(hexDimensions) {
  var positionArray = [];
  var pixelCoordinates;

  //For every hex, place an instance of the original mesh. The symbol fills in 3 of the 6 lines, the other 3 being shared with an adjacent hex

  //Make a hexagonal grid of hexagons since it is approximately circular.
  //The radius should be a bit larger than our max viewing distance
  var u = 0;
  var v = 0;
  //For each radius
  positionArray.push({ y: 0, x: 0 });
  for (var i = 1; i < 31; i++) {
    //Hold u constant as the radius, add an instance for each v
    for (v = -i; v <= 0; v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(i, v);

      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold u constant as negative the radius, add an instance for each v
    for (v = 0; v <= i; v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(-i, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold v constant as the radius, add an instance for each u
    for (u = -i + 1; u <= 0; u++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, i);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold v constant as negative the radius, add an instance for each u
    for (u = 0; u < i; u++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, -i);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold w constant as the radius, add an instance for each u + v = -i
    for (u = -i + 1, v = -1; v > -i; u++, v--) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold w constant as the negative radius, add an instance for each u + v = i
    for (u = i - 1, v = 1; v < i; u--, v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }
  }

  return positionArray;
};
