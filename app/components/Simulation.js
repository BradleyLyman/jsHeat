'use strict';
let Three             = require('three'),
    ThreeMixin        = require('../ThreeMixin.js'),
    React             = require('react'),
    gpgc              = require('jsgpgc'),

    DataFrameRenderer = require('../dataFrameRenderer.js'),
    HeatIntegraterSrc = require('./shaders/HeatIntegraterSrc.js'),
    DirichletSrc      = require('./shaders/DirichletSrc.js'),
    AddHeatSrc        = require('./shaders/AddHeatSrc.js');

gpgc.init(Three);

/**
 * This component runs and presents the actual simulation.
 **/
const Scene = React.createClass({
  mixins : [ThreeMixin],

  componentDidMount : function() {
    this.renderer.setClearColor(0x333333);
    this.renderer.autoClear = false;
    this.isPressed = false;

    if (this.sfr === undefined) {
      this.sfr = DataFrameRenderer.create();
      this.sf  = gpgc.DataFrame.create(512);

      this.bcKernel       = this.sf.createKernel(DirichletSrc);
      this.heatIntegrater = this.sf.createKernel(HeatIntegraterSrc);
      this.addHeat        = this.sf.createKernel(
        AddHeatSrc,
        { mousePos : { type : "v2", value : new Three.Vector2() } }
      );

      // execute the bcKernel over entire frame to set the initial value
      this.bcKernel.execute(this.renderer, this.sf);
      this.sf.swapBuffers();
    }

    this.mousePos = new Three.Vector2();
    this.start();
  },

  updateScene : function() {
    this.addHeat.setUniform("mousePos", this.mousePos);
    for (let i = 0; i < 30; i++) {
      this.heatIntegrater.executeBody(this.renderer, this.sf);
      if (this.isPressed === true) {
        this.sf.swapBuffers();
        this.addHeat.executeBody(this.renderer, this.sf);
      }
      this.bcKernel.executeBc(this.renderer, this.sf);
      this.sf.swapBuffers();
    }

    this.renderer.setViewport(
      0, 0, this.canvasWidth, this.canvasHeight
    );
    this.sfr.render(this.renderer, this.sf);
  },

  onResize : function() {
    let dims = {
      width  : this.canvasWidth,
      height : this.canvasHeight,
    };
    this.sfr.resize(dims);
  },

  onMouseDown : function() {
    this.isPressed = true;
  },

  onMouseUp : function() {
    this.isPressed = false;
  },

  onMouseLeave : function() {
    this.isPressed = false;
  },

  onMouseMove : function(e) {
    let h = this.canvasHeight;
    let w = this.canvasWidth;

    // calc normalized mouse coords
    let sx = e.nativeEvent.clientX / w;
    let sy = (h - e.nativeEvent.clientY) / h;

    // calculate normalized mouse coords scaled
    // by aspect ratio. dif offset accounts for
    // centered image
    let aspect = w / h;
    if (h < w) {
      sx *= aspect;
      let dif = aspect - 1;
      sx -= dif/2.0;
    } else {
      sy /= aspect;
      let dif = (1.0/aspect) - 1;
      sy -= dif/2.0;
    }

    this.mousePos.x = sx;
    this.mousePos.y = sy;
  },

  render : function() {
    return (
      <div>
        <canvas
          style={{ minWidth : '100%',
                   maxWidth : '100%',
                   minHeight : '99vh',
                   maxHeight : '100vh'}}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          ref="canvas" />
      </div>
    );
  },
});

module.exports = Scene;
