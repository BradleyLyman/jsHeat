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
Kernel.prototype.executeScene =
    function(renderer, scalarFieldTgt, scene) {
  renderer.setViewport(0, 0, this.size, this.size);
  renderer.render(scene, this.camera, scalarFieldTgt.rtt);
  renderer.setViewport(
    0, 0, renderer.size.width, renderer.size.height
  );
};

Kernel.prototype.execute =
    function(renderer, scalarFieldTgt) {
  this.executeScene(renderer, scalarFieldTgt, this.scene);
};

Kernel.prototype.executeBc =
    function(renderer, scalarFieldTgt) {
  this.executeScene(renderer, scalarFieldTgt, this.bcScene);
};

Kernel.prototype.executeBody =
    function(renderer, scalarFieldTgt) {
  this.executeScene(renderer, scalarFieldTgt, this.bodyScene);
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

  let bcScene = new Three.Scene();
  let lineGeometry = new Three.Geometry();
  lineGeometry.vertices.push(
    new Three.Vector3(dim, dim, 0.0),
    new Three.Vector3(dim, -dim+1, 0.0),
    new Three.Vector3(-dim+1, -dim, 0.0),
    new Three.Vector3(-dim+1, dim, 0.0),
    new Three.Vector3(dim, dim, 0.0),
  );
  bcScene.add(
    new Three.Line(lineGeometry, material)
  );

  let bodyScene = new Three.Scene();
  let bodyGeometry =
    new Three.PlaneGeometry(sideLen-2, sideLen-2);
  bodyScene.add(
    new Three.Mesh(bodyGeometry, material)
  );

  return {
    __proto__ : Kernel.prototype,
    scene     : scene,
    bcScene   : bcScene,
    bodyScene : bodyScene,
    camera    : camera,
    size      : sideLen,
  };
};

module.exports.create = createKernel;
