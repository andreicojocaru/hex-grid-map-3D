"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ZStackingDataLink
 */
 
 var makeDataLink = require('data-chains/src/DataLinkMixin');
 
/**
 * This will make a clone of of the mesh with the given id, except shrunken and translucent
 * @constructor
 */
module.exports = function CloningDataLink() {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof CloningDataLink)) {
        return new CloningDataLink();
    }
    makeDataLink.call(this);
    this.meshMap = {};
};

module.exports.prototype.onDataChanged = function(event) {

    var i, mesh, item, groupKey, cellGroup;
    var added = [];
    for (i = 0; i < event.added.length; i++) {
        if (!!event.added[i].clonesId) {
            mesh = this.meshMap[event.added[i].clonesId];
            var cloned = mesh.clone(event.added[i].id);
            if (!!event.added[i].cloneScale) {
                cloned.scaling.x = event.added[i].cloneScale;
                cloned.scaling.y = event.added[i].cloneScale;
                cloned.scaling.z = event.added[i].cloneScale;
            }
            
            if (!!event.added[i].cloneAlpha) {
                cloned.material.alpha = event.added[i].cloneAlpha;
            }
            cloned.data = {};
            cloned.data.item = event.added[i];
            cloned.isCellItem = mesh.isCellItem;
            added.push(cloned);
            
        } else {
            this.meshMap[event.added[i].data.item.id] = event.added[i];
            added.push(event.added[i]);
        }
       
    }
    
    this.emitEvent('dataChanged', [{added:added, removed:event.removed, updated:event.updated}]);
};

module.exports.prototype.setScene = function(scene) {
    this.scene = scene;
};



