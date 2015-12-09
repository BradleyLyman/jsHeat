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
          64, 0.5, this.renderer
        );
        this.kernel = this.sf.createKernel(`
          void main() {
            gl_FragColor = vec4(1.0);
          }
        `);
        this.kernel.execute(this.renderer, this.sf);

        let bcKernel = this.sf.createKernel(`
          void main() {
            gl_FragColor = vec4(0.2);
          }
        `);
        bcKernel.executeBc(this.renderer, this.sf);

        let bodyKernel = this.sf.createKernel(`
          void main() {
            gl_FragColor = vec4(0.5);
          }
        `);
        bodyKernel.executeBody(this.renderer, this.sf);
      }
      this.start();
    },

    updateScene : function() {
      //this.renderer.clear();
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
