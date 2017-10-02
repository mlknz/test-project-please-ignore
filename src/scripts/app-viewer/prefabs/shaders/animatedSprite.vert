precision highp float;
precision mediump int;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

attribute vec4 transform1;
attribute vec4 transform2;
attribute vec4 transform3;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

uniform float vertexSwayAmplitude;
uniform float vertexSwayAmplitudeNormal;

uniform float swayFrequency;
uniform float swayAmplitude;

uniform float time;
uniform float atlasSize;

varying vec2 vUv;
varying vec3 vViewPosition;

varying vec2 vTexOffset;

varying float vSway;

mat4 transpose(in highp mat4 inMatrix) {
    highp vec4 i0 = inMatrix[0];
    highp vec4 i1 = inMatrix[1];
    highp vec4 i2 = inMatrix[2];
    highp vec4 i3 = inMatrix[3];

    highp mat4 outMatrix = mat4(
         vec4(i0.x, i1.x, i2.x, i3.x),
         vec4(i0.y, i1.y, i2.y, i3.y),
         vec4(i0.z, i1.z, i2.z, i3.z),
         vec4(i0.w, i1.w, i2.w, i3.w)
         );

    return outMatrix;
}

void main() {
    vec4 tr1 = transform1;
    vec4 tr2 = transform2;
    vec4 tr3 = transform3;
    vec4 tr4 = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 objectNormal = mat3(
        vec3(transform1.x, transform2.x, transform3.x),
        vec3(transform1.y, transform2.y, transform3.y),
        vec3(transform1.z, transform2.z, transform3.z)
    ) * vec3( normal );

    float seed = (transform1.w + transform3.w) * transform1.x * transform3.z * 12345.678;

    vSway = sin(swayFrequency * time + seed) * uv.y * uv.y;
    float swayN = sin(time + seed * 0.246) * uv.y;

    // vertex sway
    tr1.w += objectNormal.x * vertexSwayAmplitudeNormal * swayN - objectNormal.z * vertexSwayAmplitude * vSway;
    tr3.w += objectNormal.z * vertexSwayAmplitudeNormal * swayN + objectNormal.x * vertexSwayAmplitude * vSway;

    mat4 modelMatrix = transpose(mat4(tr1, tr2, tr3, tr4));
    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_Position = projectionMatrix * mvPosition;

    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    float texSeed = mod(transform1.w * transform3.w * 123456.456, atlasSize * atlasSize);

    vTexOffset = vec2(
        floor(texSeed / atlasSize),
        floor(mod(texSeed, atlasSize))
    ) / atlasSize;

    vSway *= swayAmplitude;

    vViewPosition = - mvPosition.xyz;
    vUv = uv / atlasSize + vTexOffset;
}
