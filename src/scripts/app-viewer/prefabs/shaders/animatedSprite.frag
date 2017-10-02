precision highp float;
precision mediump int;

uniform sampler2D map;
uniform float time;

uniform float atlasSize;

varying vec3 vViewPosition;
varying vec2 vUv;

varying vec2 vTexOffset;

varying float vSway;

void main() {
    vec2 cUv = (vUv - vTexOffset) * atlasSize; // [0, 1]

    float transformedX = clamp(vSway + cUv.x, 0., 1.) / atlasSize + vTexOffset.x; // clamp could be removed if texture is fine
    vec4 col = texture2D(map, vec2(transformedX , vUv.y));
    if (col.a < 0.1) discard; // attenuate with vViewPosition.z if dependence on range is needed
    gl_FragColor = vec4(col.rgb, 1.);
}
