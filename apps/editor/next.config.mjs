import "./env.js";
import "@ninjagl/auth/env";

import nextPWA from '@ducanh2912/next-pwa';
import nextBundleAnalyzer from '@next/bundle-analyzer';
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypePrism from "@mapbox/rehype-prism";
// import urlLoader from 'url-loader';
// import fileLoader from 'file-loader';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = nextMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

/**
 * A fork of 'next-pwa' that has app directory support
 * @see https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
 */
const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@ninjagl/dbapi",
    "@ninjagl/auth",
    "@ninjagl/db",
    "@ninjagl/ui",
    "@ninjagl/validators",
    "@ninjagl/core",
  ],  
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // mdxを読み込めるようにする
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Rewrite your self domain to your Vercel domain
        hostname: 'qhhiooxw225gfiet.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, { isServer }) {
    // audio support
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: config.inlineImageLimit,
            fallback: 'file-loader',
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // markdown support
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },
};

const KEYS_TO_OMIT = [
  'webpackDevMiddleware',
  'configOrigin',
  'target',
  'analyticsId',
  'webpack5',
  'amp',
  'assetPrefix',
];

// eslint-disable-next-line import/no-anonymous-default-export
export default (_phase, { defaultConfig }) => {
  const plugins = [[withPWA], [withBundleAnalyzer, {}], [withMDX]];

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  });
  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });
  return finalConfig;
};
