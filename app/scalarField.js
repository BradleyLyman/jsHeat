'use strict';
let Three = require('three');

let ScalarField = {};

ScalarField.prototype = {};
ScalarField.prototype.get = function(x, y) {
  return this.data[y * this.sideLen + x];
};

ScalarField.prototype.set = function(x, y, val) {
  this.data[y * this.sideLen + x] = val;
};

ScalarField.prototype.asTexture = function() {
  let tex = new Three.DataTexture(
      this.data, this.sideLen, this.sideLen, Three.AlphaFormat, Three.FloatType
  );
  tex.minFilter   = Three.NearestFilter;
  tex.magFilter   = Three.LinearFilter;
  tex.needsUpdate = true;
  return tex;
};

let create = function(sideLen, initialValue) {
  let field     = {
    __proto__ : ScalarField.prototype,
    sideLen   : sideLen,
    data      : new Float32Array(sideLen * sideLen),
  };

  for (let i = 0; i < field.data.length; i++) {
    field.data[i] = initialValue;
  }
  console.log(initialValue);
  console.log(field.data);
  return field;
};

module.exports.create = create;
