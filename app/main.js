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
      Link        = ReactRouter.Link;

  const Scene = React.createClass({
    mixins : [ThreeMixin],

    componentDidMount : function() {
      if (this.scene === undefined) {
        this.scene = new Three.Scene();

        let geometry = new Three.BoxGeometry(1,1,1);
        let material = new Three.MeshBasicMaterial(
            { color : 0x00ff00 });
        this.cube = new Three.Mesh(geometry, material);

        this.scene.add(this.cube);
      }

      if (this.camera === undefined) {
        this.camera = new Three.PerspectiveCamera(
            75, 800/600, 1, 400);
        this.camera.position.z = 5;
      }
      this.start();
    },

    updateScene : function() {
      this.cube.rotation.x += 0.011;
      this.cube.rotation.y += 0.02;
      this.renderer.render(this.scene, this.camera);
    },

    onResize : function() {
      let dims = {
        width  : this.canvasWidth,
        height : this.canvasHeight,
      };
      this.camera.aspect = dims.width/dims.height;
      this.camera.updateProjectionMatrix();
    },

    render : function() {
      return (
        <div style={{ border : '1px solid black' }}>
          <p>Scene</p>
          <canvas
            style={{ minWidth : '100%',
                     maxWidth : '100%',
                     minHeight : '50vh',
                     maxHeight : '51vh'}}
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
