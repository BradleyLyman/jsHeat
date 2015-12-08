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
  struct ColorPoint {
    vec4 color;
    float d;
  };

  void main() {
    ColorPoint gradient[4];
    gradient[0] = ColorPoint(vec4(0.0), 0.0);
    gradient[1] = ColorPoint(vec4(0.0,0.0,1.0,1.0), 0.3);
    gradient[2] = ColorPoint(vec4(0.0,1.0,0.0,1.0), 0.6);
    gradient[3] = ColorPoint(vec4(1.0,0.0,0.0,1.0), 1.0);

    float val = texture2D(data, varyUv).a;

    float max = 1.0;
    vec4 finalColor = vec4(0.0);
    for (int i = 1; i < 4; i++) {
      finalColor =
        mix(finalColor, gradient[i].color,
            smoothstep(
              gradient[i-1].d, gradient[i].d, (val/max)
            )
        );
    }

    gl_FragColor = finalColor;
  }
`;

let sfRenderer = {};

sfRenderer.prototype = {};
sfRenderer.prototype.render = function(renderer, scalarField) {
  this.uniforms.data.value = scalarField.rtt;
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
