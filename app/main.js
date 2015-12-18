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
      Simulation  = require('./components/Simulation.js');

  const Routes = (
    <Route path="/" component={Simulation}/>
  );

  ReactDOM.render(
    <Router>{Routes}</Router>,
    document.getElementById('app')
  );
}());
