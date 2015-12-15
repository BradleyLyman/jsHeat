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
      this.renderer.size =
        { width : 1, height : 1 };

      this.renderer.autoClear = false;

      if (this.sfr === undefined) {
        this.sfr = SfRenderer.create();
        this.sf  = ScalarField.create(
          256, 0.3, this.renderer
        );
        this.bcKernel = this.sf.createKernel(`
          void main() {
            gl_FragColor = vec4(0.0);
          }
        `);

        this.heatIntegrater = this.sf.createKernel(`
          vec2 lr(vec2 p) {
            vec2 left = p - vec2(1.0/n, 0.0);
            vec2 right = p + vec2(1.0/n, 0.0);
            vec2 res;
            res.x = texture2D(data, left).a;
            res.y = texture2D(data, right).a;
            return res;
          }

          vec2 bt(vec2 p) {
            vec2 t = p + vec2(0.0, 1.0/n);
            vec2 b = p - vec2(0.0, 1.0/n);
            vec2 res;
            res.x = texture2D(data, t).a;
            res.y = texture2D(data, b).a;
            return res;
          }

          void main() {
            float dt = 0.000003;
            vec2 point = snapToGrid(varyUv);
            vec2 p0p2 = lr(point);
            vec2 p3p4 = bt(point);
            float p1 = texture2D(data, point).a;

            gl_FragColor = vec4(p1 + dt*n*n*(p0p2.x + p0p2.y + p3p4.x + p3p4.y - 4.0*p1));
          }
        `);
      }
      this.start();
    },

    updateScene : function() {
      for (let i = 0; i < 10; i++) {
        this.heatIntegrater.executeBody(this.renderer, this.sf);
        this.bcKernel.executeBc(this.renderer, this.sf);
        this.sf.swapBuffers();
      }

      this.sfr.render(this.renderer, this.sf);
    },

    onResize : function() {
      let dims = {
        width  : this.canvasWidth,
        height : this.canvasHeight,
      };
      this.renderer.size = dims;
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
