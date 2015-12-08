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
      this.renderer.size = { width : 1, height : 1 };

      if (this.sfr === undefined) {
        this.sfr = SfRenderer.create();
        this.sf  = ScalarField.create(512, 0.5, this.renderer);
      }
      this.start();
    },

    updateScene : function() {
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
