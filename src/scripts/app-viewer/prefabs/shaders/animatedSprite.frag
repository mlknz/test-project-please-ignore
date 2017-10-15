precision highp float;

varying vec2 vUv;
uniform sampler2D map;
uniform vec3 color;
uniform float opacity;

void main() {
    gl_FragColor = texture2D(map, vUv);
    gl_FragColor.rgb *= color;
    gl_FragColor.a *= opacity;
}
