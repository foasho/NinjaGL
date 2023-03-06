/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,// trueにすると2回レンダーされる
  env: {
    OPEN_AI_KEY: process.env.OPEN_AI_KEY,
  }
}

module.exports = nextConfig
