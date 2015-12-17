'use strict';
(function() {
  let Three       = require('three'),
      ThreeMixin  = require('./ThreeMixin.js'),
      React       = require('react'),
      ReactDOM    = require('react-dom'),
      ReactRouter = require('react-router'),
      Router      = ReactRouter.Router,
      Route       = ReactRouter.Route,
      Link        = ReactRouter.Link,
      gpgpc       = require('jsgpgc'),
      DataFrameRenderer = require('./dataFrameRenderer.js');

  gpgpc.init(Three);

  const Scene = React.createClass({
    mixins : [ThreeMixin],

    componentDidMount : function() {
      this.renderer.setClearColor(0x333333);
      this.renderer.autoClear = false;
      this.isPressed = false;

      if (this.sfr === undefined) {
        this.sfr = DataFrameRenderer.create();
        this.sf = gpgpc.DataFrame.create(512);

        this.bcKernel = this.sf.createKernel(`
          void main() {
            gl_FragColor = vec4(0.0);

          }
        `);

        // execute the bcKernel over entire frame to set the initial value
        this.bcKernel.execute(this.renderer, this.sf);
        this.sf.swapBuffers();
        this.bcKernel.execute(this.renderer, this.sf);
        this.sf.swapBuffers();

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

  const Routes = (
    <Route path="/" component={Scene}/>
  );

  ReactDOM.render(<Router>{Routes}</Router>, document.body);
}());
