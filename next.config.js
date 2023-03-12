const withTM = require("next-transpile-modules")([
  "three",
  "@react-three/fiber",
  "@react-three/drei",
]);

const nextConfig = withTM({
  reactStrictMode: false,// trueにすると2回レンダーされる
  env: {
    OPEN_AI_KEY: process.env.OPEN_AI_KEY,
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glb|gltf|glsl|frag|vert)$/,
      use: [
        options.defaultLoaders.babel,
        { loader: "raw-loader" },
        { loader: "glslify-loader" },
        { loader: 'file-loader'}
      ]
    })
    return config
  }
});

module.exports = nextConfig
