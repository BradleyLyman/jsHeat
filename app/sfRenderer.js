'use strict';
let Three = require('three');

const vertexShaderSrc = `
  varying vec2 varyUv;
  void main() {
    varyUv = uv;
    gl_Position =
        modelViewMatrix * projectionMatrix *
        vec4(position, 1.0);
  }
`;

const fragmentShaderSrc = `
  varying vec2 varyUv;
  uniform sampler2D data;
  void main() {
    gl_FragColor =
      texture2D(data, varyUv).a *
      vec4(0.2, 0.2, 0.8, 1.0);
  }
`;

let sfRenderer = {};

sfRenderer.prototype = {};
sfRenderer.prototype.render = function(renderer, dataTex, target) {
  this.uniforms.data.value = dataTex;
  renderer.render(this.scene, this.camera);
};

sfRenderer.prototype.resize = function(dims) {
  let aspect = dims.width/dims.height;
  if (dims.width >= dims.height) {
    this.camera.top = 1.0;
    this.camera.bottom = -1.0;
    this.camera.left = -aspect;
    this.camera.right = aspect;
  } else {
    this.camera.left = -1.0;
    this.camera.right = 1.0;
    this.camera.top = 1.0/aspect;
    this.camera.bottom = -1.0/aspect;
  }
  this.camera.updateProjectionMatrix();
};

let createSfRenderer = function() {
  let uniforms = { data : { type : "t" } };
  let material = new Three.ShaderMaterial({
    vertexShader   : vertexShaderSrc,
    fragmentShader : fragmentShaderSrc,
    uniforms       : uniforms,
  });

  let camera = new Three.OrthographicCamera(
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
  );

  let scene         = new Three.Scene();
  let planeGeometry = new Three.PlaneGeometry(2, 2);
  let plane = new Three.Mesh(planeGeometry, material);
  scene.add(plane);
  console.log(plane);
  return {
    __proto__ : sfRenderer.prototype,
    scene     : scene,
    camera    : camera,
    uniforms  : uniforms,
  };
};

module.exports.create = createSfRenderer;
