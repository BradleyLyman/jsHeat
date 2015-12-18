'use strict';

module.exports = `
  uniform vec2 mousePos;
  void main() {
    vec2 pos = mousePos;
    float dis = length(pos - varyUv);
    float val = texture2D(data, varyUv).a;

    gl_FragColor = vec4(val + 2.0 * exp(-dis*70.0));
  }
`;
