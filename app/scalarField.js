'use strict';
let Three = require('three'),
    Kernel = require('./kernel.js');

let ScalarField = {};

ScalarField.prototype = {};

let create = function(sideLen, initialValue, renderer) {
  let initializerKernel = Kernel.create(sideLen, `
    void main() {
      gl_FragColor = vec4(${initialValue});
    }
  `);

  let renderTarget = new Three.WebGLRenderTarget(
    sideLen, sideLen, {
      depthBuffer : false,
      stencilBuffer : false,
      generateMipmaps : false,
      format : Three.RGBAFormat,
      type : Three.FloatType
    }
  );

  initializerKernel.execute(renderer, renderTarget);

  return {
    __proto__ : ScalarField.prototype,
    rtt       : renderTarget,
  };
};

module.exports.create = create;
