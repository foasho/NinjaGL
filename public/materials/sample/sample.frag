precision highp float;

varying vec2 vUv;

uniform vec2 resolution; // 画面の大きさ
uniform float time; // 経過秒数

void main(void) {
    // vUv = uv;
    vec2 pos = gl_FragCoord.xy / resolution;
    gl_FragColor = vec4(vUv, 0.0, 1.0);
    
}