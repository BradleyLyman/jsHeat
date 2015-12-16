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
      this.isPressed = false;

      if (this.sfr === undefined) {
        this.sfr = SfRenderer.create();
        this.sf  = ScalarField.create(
          512, 0.0, this.renderer
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
            float dt = 0.1;
            vec2 point = snapToGrid(varyUv);
            vec2 p0p2 = lr(point);
            vec2 p3p4 = bt(point);
            float p1 = texture2D(data, point).a;

            gl_FragColor = vec4(p1 + dt*(p0p2.x + p0p2.y + p3p4.x + p3p4.y - 4.0*p1));
          }
        `);

        this.addHeat = this.sf.createKernel(`
          uniform vec2 mousePos;
          void main() {
            vec2 pos = mousePos;
            float dis = length(pos - varyUv);
            float val = texture2D(data, varyUv).a;

            gl_FragColor = vec4(val + 2.0 * exp(-dis*80.0));
          }
        `, { mousePos : { type : "v2", value : new Three.Vector2() } });
      }
      this.mousePos = new Three.Vector2();
      this.start();
    },

    updateScene : function() {
      this.addHeat.setUniform("mousePos", this.mousePos);
      for (let i = 0; i < 60; i++) {
        this.heatIntegrater.executeBody(this.renderer, this.sf);
        if (this.isPressed) {
          this.sf.swapBuffers();
          this.addHeat.executeBody(this.renderer, this.sf);
        }
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

    onMouseDown : function() {
      console.log('down');
      this.isPressed = true;
    },

    onMouseUp : function() {
      console.log('up');
      this.isPressed = false;
    },

    onMouseLeave : function() {
      console.log('leave');
      this.isPressed = false;
    },

    onMouseMove : function(e) {
      let dims = this.renderer.size;
      // calc normalized mouse coords
      let sx = e.nativeEvent.x / dims.width;
      let sy = (dims.height - e.nativeEvent.y) / dims.height;

      // calculate normalized mouse coords scaled
      // by aspect ratio. dif offset accounts for
      // centered image
      let aspect = dims.width / dims.height;
      if (dims.height < dims.width) {
        sx *= aspect;
        let dif = aspect - 1;
        sx -= dif/2.0;
      } else {
        sy /= aspect;
        let dif = (1.0/aspect) - 1;
        sy -= dif/2.0;
      }

      //console.log(sx, sy);
      this.mousePos.x = sx;
      this.mousePos.y = sy;
    },

    render : function() {
      return (
        <div>
          <canvas
            style={{ minWidth : '100%',
                     maxWidth : '100%',
                     minHeight : '90vh',
                     maxHeight : '91vh'}}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseLeave={this.onMouseLeave}
            onMouseMove={this.onMouseMove}
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
