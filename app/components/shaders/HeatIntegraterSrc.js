'use strict';

module.exports = `
  // sample points to the left and right of p
  vec2 lr(vec2 p) {
    vec2 left = p - vec2(1.0/n, 0.0);
    vec2 right = p + vec2(1.0/n, 0.0);
    vec2 res;
    res.x = texture2D(data, left).a;
    res.y = texture2D(data, right).a;
    return res;
  }

  // sample points to the top and bottom of p
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

    // calculate 2nd order difference, note we don't multiply
    // by 1/h^2 -- this allows for larger dt values.
    // This effectively lowers the apparent curvature of the heat function
    // which gives the same effect as making heat diffuse more slowly.
    gl_FragColor = vec4(p1 + dt*(p0p2.x + p0p2.y + p3p4.x + p3p4.y - 4.0*p1));
  }
`;
