precision mediump float;

varying vec2 vUv;
uniform sampler2D map;
uniform vec3 color;

void main() {
    gl_FragColor = texture2D(map, vUv);
    gl_FragColor.rgb *= color;
}
