'use strict';
let Three = require('three'),
    Kernel = require('./gpgpu/kernel.js');

const RENDER_TARGET_SETTINGS = {
  depthBuffer     : false,
  stencilBuffer   : false,
  generateMipmaps : false,
  minFilter       : Three.NearestFilter,
  magFilter       : Three.LinearFilter,
  format          : Three.RGBAFormat,
  type            : Three.FloatType,
};

let ScalarField = {};

ScalarField.prototype = {};
ScalarField.prototype.createKernel = function(kernelSrc, customUniforms) {
  return Kernel.create(this.sideLen, kernelSrc, customUniforms);
};

ScalarField.prototype.swapBuffers = function() {
  let temp   = this.read;
  this.read  = this.write;
  this.write = temp;
};

let create = function(sideLen, initialValue, renderer) {
  let initializerKernel = Kernel.create(sideLen, `
    void main() {
      gl_FragColor = vec4(${initialValue});
    }
  `);

  let readTarget = new Three.WebGLRenderTarget(
    sideLen, sideLen, RENDER_TARGET_SETTINGS
  );

  let writeTarget = new Three.WebGLRenderTarget(
    sideLen, sideLen, RENDER_TARGET_SETTINGS
  );

  let sf = {
    __proto__ : ScalarField.prototype,
    read      : readTarget,
    write     : writeTarget,
    sideLen   : sideLen,
  };

  initializerKernel.execute(renderer, sf);
  sf.swapBuffers();
  initializerKernel.execute(renderer, sf);

  return sf;
};

module.exports.create = create;
