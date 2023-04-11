varying vec2 vUv;
uniform sampler2D shadowMap;
uniform mat4 shadowMatrix;
void main(){
  float uStripeCount = 100.0;
  float uStripeWidth = 0.1;
  // UV座標をストライプで割り、小数部分を取得
  float stripe = mod(vUv.y * uStripeCount, 1.0 / uStripeWidth);
  // StripeColorを決める
  vec3 stripeColor = step(stripe, 0.5 / uStripeWidth) * vec3(1.0);
  vec4 shadowColor = texture2D(shadowMap, vUv);
  float shadowFactor = step(vUv.y - 0.001, shadowColor.r);
  if (stripeColor == vec3(0.0)){
    gl_FragColor = vec4(.0, .0, .0, .0);
  }
  else {
    gl_FragColor = vec4(mix(stripeColor, shadowColor.rbg, shadowFactor), 1.0);
  }
}