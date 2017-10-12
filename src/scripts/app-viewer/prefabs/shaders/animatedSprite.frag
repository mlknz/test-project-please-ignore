precision highp float;

varying vec2 vUv;
uniform sampler2D map;
uniform float isPositive; // todo: multiplyColor

void main() {
    vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), isPositive);
    gl_FragColor = texture2D(map, vUv);
    gl_FragColor.rgb *= color;
}
