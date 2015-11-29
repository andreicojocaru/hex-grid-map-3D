"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module RegularPolygonDrawnItemFactory
 */
 
var babylon = require('babylonjs/babylon.max.js');

/**
 * Factory which delegates to the paper.js RegularPoloygon constructor
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 * @see {@link http://paperjs.org/reference/path/#path-regularpolygon-object | RegularPolygon }
 */
module.exports = function RegularPolygonDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
    this.internalId = 0;
};

/**
 * Return an arrow path item for the given object
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.lineColor - The color of the arrow's border
 * @param {Color} item.fillColor - The color to fill this item with
 * @param {integer} item.radius - The radius of the item
 * @param {number} item.sides - The number of sides of the item
 * @param {onClick=} item.onClick - The callback to use when this item is clicked
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 * @todo consider using symbols for performance
 */
module.exports.prototype.getDrawnItem = function(item, scene) {
    
   var cylinder = babylon.Mesh.CreateCylinder("test"+this.internalId++, 
        2, item.radius, item.radius - 5, item.sides, 2, scene, true);
        var material = new babylon.StandardMaterial("textureX"+this.internalId, scene);
        var rgb = this.hexToRgb(item.color);
    material.diffuseColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
    cylinder.material = material;
   this.internalId++;
   cylinder.data = {};
   cylinder.data.item = item;
   cylinder.rotation.x = -Math.PI/2;
   return cylinder;
   /*
       var radius = item.radius * this.hexDefinition.hexagon_edge_to_edge_width/200; //Draw it a bit big, we'll trim it into a circle
       var sphere = babylon.Mesh.CreateSphere(item.id, 16, item.radius, scene);
       var material = new babylon.StandardMaterial("textureX", scene);
       material.emissiveColor = new babylon.Color3(1, 0, 0);
       sphere.material = material;
       sphere.data = {};
       sphere.data.item = item;
    return sphere;
    */
};

module.exports.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};