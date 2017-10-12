precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float scaleX;
uniform float scaleY;
uniform float quadNumber;

varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    float y = floor(quadNumber / scaleX);
    float x = quadNumber - scaleX * y;
    vUv = (uv + vec2(x, y)) / vec2(scaleX, scaleY);
}
