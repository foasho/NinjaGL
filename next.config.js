const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
  
  /**
   * A fork of 'next-pwa' that has app directory support
   * @see https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
   */
  const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  });

  const TerserPlugin = require("terser-webpack-plugin"); // 追加
  
  const nextConfig = {
    // uncomment the following snippet if using styled components
    // compiler: {
    //   styledComponents: true,
    // },
    reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
    experimental: {
      reactRoot: 'concurrent',
      appDir: true,
    },
    images: {},
    webpack(config, { isServer }) {
      // audio support
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        exclude: config.exclude,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: config.inlineImageLimit,
              fallback: require.resolve('file-loader'),
              publicPath: `${config.assetPrefix}/_next/static/images/`,
              outputPath: `${isServer ? '../' : ''}static/images/`,
              name: '[name]-[hash].[ext]',
              esModule: config.esModule || false,
            },
          },
        ],
      })
  
      // shader support
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      });

      // InstanceAPIのクラス名と変数名を変更しないように設定
      if (!isServer) {
        const terserIndex = config.optimization.minimizer.findIndex(
          (item) => item instanceof TerserPlugin
        );
  
        if (terserIndex > -1) {
          const options = config.optimization.minimizer[terserIndex].options;
  
          // クラス名と変数名の変更を防ぐための設定を追加
          options.terserOptions.keep_classnames = /Web3Instance|EngineInstance|AxiosInstance/;
          options.terserOptions.keep_fnames = /Web3Instance|EngineInstance|AxiosInstance/;
  
          config.optimization.minimizer[terserIndex] = new TerserPlugin(options);
        }
      }
  
      return config
    },
  }
  
  const KEYS_TO_OMIT = ['webpackDevMiddleware', 'configOrigin', 'target', 'analyticsId', 'webpack5', 'amp', 'assetPrefix']
  
  module.exports = (_phase, { defaultConfig }) => {
    const plugins = [[withPWA], [withBundleAnalyzer, {}]]
  
    const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
      ...defaultConfig,
      ...nextConfig,
    })
  
    const finalConfig = {
      env: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        STORAGE_TYPE: process.env.STORAGE_TYPE, 
      },
    }
    Object.keys(wConfig).forEach((key) => {
      if (!KEYS_TO_OMIT.includes(key)) {
        finalConfig[key] = wConfig[key]
      }
    });
    return finalConfig
  }