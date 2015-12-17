/**
 * Exports a factory function for creating gpgpu Kernels which enable
 * code to be executed on the gpu.
 * @module gpgpu/Kernel
 **/
'use strict';
let Three  = require('three'),
    assign = require('object-assign');

/**
 * Vertex shader source code -- simply renders the geometry and passes
 * true uv coordinates to the fragment shader.
 **/
const vertexShaderSrc = `
  uniform float n;
  varying vec2 varyUv;
  void main() {
    vec2 offset = vec2(n/2.0);
    vec2 tpos   = position.xy + offset;
    varyUv      = tpos / n;
    gl_Position = vec4(2.0 * position / n, 1.0);
  }
`;

/**
 * Fragment shader source code leading content.
 * 2 uniforms are provided to the shader:
 *   - n which is the side length (in texels) of the data texture
 *   - data is the sampler which is used to read data from.
 * The vaying varyUv is provided by the vertex shader and
 * represents the current fragment's location in the destination
 * texture.
 * The function snapToGrid is provided. It simply rounds the given
 * position vector to the nearest texel coordinate.
 **/
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

/** @class Kernel */
let Kernel = {};

Kernel.prototype = {
  /** @lends Kernel */

  /**
   * Executes the kernel over a region in the data corresponding
   * to the geometry in the scene.
   * By choosing scenes we can execute on all of the data, or
   * merely a portion of the data (like the boundaries for example).
   * @param renderer - THREE.js WebGLRenderer instance.
   * @param dataFrame - Instance of a scalarField.
   * @param scene - Scene containing target geometry.
   **/
  _executeScene : function(renderer, dataFrame, scene) {
    this.uniforms.data.value = dataFrame.read;
    renderer.setViewport(0, 0, this.size, this.size);
    renderer.render(scene, this.camera, dataFrame.write);
  },

  /**
   * Executes the kernel over the entire dataset.
   * @param renderer - THREE.js WebGLRenderer instance.
   * @param dataFrame - Instance of a scalarField.
   **/
  execute : function(renderer, dataFrame) {
    this._executeScene(renderer, dataFrame, this.scene);
  },

  /**
   * Executes the kernel over the edges of the dataset.
   * Thus the kernel only hits the top, bottom, left, and right
   * edge texels of the dataset.
   * @param renderer - THREE.js WebGLRenderer instance.
   * @param dataFrame - Instance of a scalarField.
   **/
  executeBc : function(renderer, dataFrame) {
    this._executeScene(renderer, dataFrame, this.bcScene);
  },

  /**
   * Executes the kernel over all parts of the dataset except
   * for the edges.
   * @param renderer - THREE.js WebGLRenderer instance.
   * @param dataFrame - Instance of a scalarField.
   **/
  executeBody : function(renderer, dataFrame) {
    this._executeScene(renderer, dataFrame, this.bodyScene);
  },

  /**
   * Set a uniform in the kernel's shaders. This is only
   * needed if you have custom uniforms in the kernel.
   * @param {String} name - The name of the uniform to set.
   * @param {Object} value - The uniform's new value.
   **/
  setUniform : function(name, value) {
    this.uniforms[name].value = value;
  },
};

/**
 * Creates a new kernel with the given source code and
 * uniform descriptors.
 * @param {Number} sideLen - Side length of the data frame.
 * @param {String} kernelSrc - Fragment Shader source code which will
 *                             be executed.
 * @param {Object} customUniforms - Optionally specify additional uniforms
 *                                  which are present in the kernelSrc.
 *                                  These will need to be set with the
 *                                  setUniform method.
 **/
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
  let camera = new Three.OrthographicCamera(1.0, 1.0, 1.0, 1.0, 1.0);

  let scene         = new Three.Scene();
  let planeGeometry = new Three.PlaneGeometry(sideLen, sideLen);
  scene.add(new Three.Mesh(planeGeometry, material));

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
