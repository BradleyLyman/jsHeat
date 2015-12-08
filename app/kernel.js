'use strict';
let Three = require('three');

const vertexShaderSrc = `
  varying vec2 varyPos;
  void main() {
    varyPos = position.xy;
    gl_Position =
        modelViewMatrix * projectionMatrix *
        vec4(position, 1.0);
  }
`;

const fragmentShaderLeader = `
  uniform float n;
  varying vec2 varyPos;
`;

let Kernel = {};

Kernel.prototype = {};
Kernel.prototype.execute =
    function(renderer, scalarFieldTgt) {
  renderer.setViewport(0, 0, this.size, this.size);
  renderer.render(
    this.scene, this.camera, scalarFieldTgt.rtt
  );
  renderer.setViewport(
    0, 0, renderer.size.width, renderer.size.height
  );
};

let createKernel = function(sideLen, kernelSrc) {
  let material = new Three.ShaderMaterial({
    uniforms : { n : { type : "f", value : sideLen } },
    vertexShader   : vertexShaderSrc,
    fragmentShader : fragmentShaderLeader + kernelSrc,
  });

  let dim = sideLen / 2;
  let camera = new Three.OrthographicCamera(
    -dim, dim, dim, -dim, 1.0, -1.0
  );

  let scene         = new Three.Scene();
  let planeGeometry = new Three.PlaneGeometry(sideLen, sideLen);
  let plane = new Three.Mesh(planeGeometry, material);
  scene.add(plane);

  return {
    __proto__ : Kernel.prototype,
    scene     : scene,
    camera    : camera,
    size      : sideLen,
  };
};

module.exports.create = createKernel;
