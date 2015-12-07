'use strict';
let Three = require('three');

const vertexShaderSrc = `
  varying vec2 varyPos;
  void main() {
    varyPos = position;
    gl_Position =
        modelViewMatrix * projectionMatrix *
        vec4(position, 1.0);
  }
`;

const fragmentShaderSrc = `
  varying vec2 varyPos;
  void main() {
    float val = 0.0;
    if (varyPos.x < 0.0) {
      val = 1.0;
    }

    gl_FragColor = vec4(1.0);
  }
`;

let Kernel = {};

Kernel.prototype = {};
Kernel.prototype.execute =
    function(renderer, target, dims) {
  renderer.setViewport(0, 0, this.size, this.size);
  renderer.render(this.scene, this.camera, target);
  renderer.setViewport(0, 0, dims.width, dims.height);
};

let createKernel = function(field) {
  let material = new Three.ShaderMaterial({
    vertexShader   : vertexShaderSrc,
    fragmentShader : fragmentShaderSrc,
  });

  let dim = field.getSideLen() / 2;
  let camera = new Three.OrthographicCamera(
    -dim, dim, dim, -dim, 1.0, -1.0
  );

  let scene         = new Three.Scene();
  let planeGeometry = new Three.PlaneGeometry(dim*2, dim*2);
  let plane = new Three.Mesh(planeGeometry, material);

  return {
    __proto__ : Kernel.prototype,
    scene     : scene,
    camera    : camera,
    size      : dim*2,
  };
};

module.exports.create = createKernel;
