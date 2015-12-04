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
      ScalarField = require('./scalarField.js');

  const Scene = React.createClass({
    mixins : [ThreeMixin],

    componentDidMount : function() {
      if (this.scene === undefined) {
        this.scene = new Three.Scene();

        let field = ScalarField.create(8, 1.0);
        field.set(2, 2, 0.0);
        let dataTexture = field.asTexture();
        let dataMaterial = new Three.MeshBasicMaterial({map: dataTexture});

        let planeGeometry = new Three.PlaneGeometry(2, 2);
        let material = new Three.ShaderMaterial({
          uniforms : { data: { type: "t", value : dataTexture } },
          vertexShader: `
            varying vec2 varyUv;
            void main() {
              varyUv = uv;
              gl_Position = modelViewMatrix * projectionMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 varyUv;

            uniform sampler2D data;

            void main() {
              gl_FragColor = vec4(texture2D(data, varyUv).a, 0.0, 0.0, 1.0);
            }
          `,
        });
        this.cube = new Three.Mesh(planeGeometry, material);

        this.scene.add(this.cube);
      }

      if (this.camera === undefined) {
        this.camera = new Three.OrthographicCamera(
          -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
        );
      }
      this.start();
    },

    updateScene : function() {
      this.renderer.render(this.scene, this.camera);
    },

    onResize : function() {
      let dims = {
        width  : this.canvasWidth,
        height : this.canvasHeight,
      };
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
