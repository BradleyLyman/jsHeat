(function() {
  'use strict';
  console.log('loaded');
  let Three       = require('three'),
      ThreeMixin  = require('./ThreeMixin.js'),
      React       = require('react'),
      ReactDOM    = require('react-dom'),
      ReactRouter = require('react-router'),
      Router      = ReactRouter.Router,
      Route       = ReactRouter.Route,
      Link        = ReactRouter.Link,
      ScalarField = require('./scalarField.js'),
      SfRenderer  = require('./sfRenderer.js'),
      Kernel      = require('./kernel.js');

  const Scene = React.createClass({
    mixins : [ThreeMixin],

    componentDidMount : function() {
      if (this.sfr === undefined) {
        this.sfr = SfRenderer.create();
        this.field = ScalarField.create(8, 1.0);
        this.field.set(2, 3, 0.0);
        this.field.set(5, 5, 0.0);
        this.kernel = Kernel.create(this.field);
      }
      let rtt = new Three.WebGLRenderTarget(
        8, 8, {
          depthBuffer : false,
          stencilBuffer : false,
          generateMipmaps : false,
          format : Three.RGBAFormat,
          type : Three.UnsignedByteType,
        }
      );
      console.log(rtt);
      this.size = { width : 1, height : 1 };
      this.start();
    },

    updateScene : function() {
      let tex = this.field.asTexture();
      let rtt = new Three.WebGLRenderTarget(
        8, 8, {
          depthBuffer : false,
          stencilBuffer : false,
          generateMipmaps : false,
          format : Three.RGBAFormat,
          type : Three.UnsignedByteType,
        }
      );
      this.kernel.execute(this.renderer, rtt, this.size);
      this.sfr.render(
        this.renderer, rtt
      );
    },

    onResize : function() {
      let dims = {
        width  : this.canvasWidth,
        height : this.canvasHeight,
      };
      this.size = dims;
      this.sfr.resize(dims);
    },

    render : function() {
      return (
        <div>
          <canvas
            style={{ minWidth : '100%',
                     maxWidth : '100%',
                     minHeight : '90vh',
                     maxHeight : '91vh'}}
            ref="canvas" />
        </div>
      );
    },
  });

  const Routes = (
    <Route path="/" component={Scene}/>
  );

  ReactDOM.render(<Router>{Routes}</Router>, document.body);
}());
