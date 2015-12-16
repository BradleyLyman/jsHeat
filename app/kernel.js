'use strict';
let Three  = require('three'),
    assign = require('object-assign');

const vertexShaderSrc = `
  uniform float n;
  varying vec2 varyUv;
  void main() {
    vec2 offset = vec2(n/2.0);
    vec2 tpos   = position.xy + offset;
    varyUv      = tpos / n;
    gl_Position =
        modelViewMatrix * projectionMatrix *
        vec4(position, 1.0);
  }
`;

const fragmentShaderLeader = `
  uniform float n;
  uniform sampler2D data;
  varying vec2 varyUv;

  float round(float x) {
    float f = fract(x);
    float b = floor(x);
    float t = ceil(x);
    float botRes = float(int(f < 0.5));
    float topRes = float(int(f >= 0.5));
    return botRes * b + topRes * t;
  }

  vec2 snapToGrid(vec2 coord) {
    vec2 offset = vec2(1.0/n * 0.5);
    vec2 result = (coord - offset)*n;
    result.x = round(result.x);
    result.y = round(result.y);

    return result/n + offset;
  }
`;

let Kernel = {};

Kernel.prototype = {};
Kernel.prototype.executeScene =
    function(renderer, scalarFieldTgt, scene) {
  this.uniforms.data.value = scalarFieldTgt.read;
  renderer.setViewport(0, 0, this.size, this.size);
  renderer.render(scene, this.camera, scalarFieldTgt.write);
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

Kernel.prototype.setUniform = function(name, value) {
  this.uniforms[name].value = value;
};

let createKernel = function(sideLen, kernelSrc, customUniforms) {
  let uniforms = assign({
      n    : { type : "f", value : sideLen },
      data : { type : "t", value : 0 },
    },
    customUniforms
  );

  let material = new Three.ShaderMaterial({
    uniforms,
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
    uniforms  : uniforms,
  };
};

module.exports.create = createKernel;
