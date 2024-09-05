const { configure } = require('quasar/wrappers');
const { checker } = require('vite-plugin-checker');

module.exports = configure(function (/* ctx */) {
  return {
    boot: ['axios'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },

      vueRouterMode: 'history',

      env: {
        API: process.env.VITE_API_URL || '', // Ensure API is a string
      },

      vitePlugins: [
        checker({
          eslint: {
            lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
          },
        }),
      ],
    },

    devServer: {
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: { '^/api': '' },
        },
      },
    },

    framework: {
      config: {},
      plugins: [],
    },

    animations: [],

    ssr: {
      pwa: true, // Enable PWA takeover
      prodPort: 3000, // Port for production server
      middlewares: ['render'], // Specify middlewares
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',

      packager: {},

      builder: {
        appId: 'e-commerce-sep-2024',
      },
    },

    bex: {
      contentScripts: ['my-content-script'],
    },
  };
});
