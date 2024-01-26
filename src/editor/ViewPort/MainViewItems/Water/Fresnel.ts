// eslint-disable-next-line import/no-anonymous-default-export
export default /* glsl */ `
float Fresnel(float power) {
    vec3 normal = vNormal;
    vec3 viewDir = normalize(vViewPosition);

    return pow((1.0 - saturate(dot(normalize(normal), normalize(viewDir)))), power);
}
`;
