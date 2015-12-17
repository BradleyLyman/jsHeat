# jsHeat
JavaScript+HTML5 interactive heat-equation solver.

## Description 

jsHeat solves the heat equation in two dimensions: du/dt = d^2u/dx^2 + d^2u/dy^2.
Space discretization is accomplished via a 2nd order central finite difference approximation.
The edges of the region are set to a given value (0.0 degrees C iirc) which is also known
as a Dirichlet boundary condition.
Discretization in time is accomplished by the explicit Euler method.

It is interesting to note that the explicit Euler method is unstable when the curvature of the heat
function is too great, the grid spacing becomes too fine, or the time step is too large. Despite these
disadvantages it was chosen because it allows u_{t+1} to be calculated for each gridpoint in 
parallel.

Highly parallel execution is achieved by doing the integration in a fragment shader via webGL.
This allows suprisingly fast and high-resolution simulations to be achieved on even modest hardware.
As a consequence, we can set the time step to be very small (so we can have a stable solution) and just
run multiple steps per frame.

----

## Next Steps
Ideally I would like to add a few features:

- Configure simulation grid resolution
- Provide error message if user's device does not support floating point textures (crucial for gpgpu integration)
- Configure boundary condition value
- Configure time step size
- Configure cycles per frame
