const publicPath = '/'
const assetsVersion = process.env.VUE_APP_ICONS_VERSION || ''
const assetsVersionSuffix = assetsVersion ? `?v=${assetsVersion}` : ''

module.exports = {
  publicPath: publicPath,
  // https://cli.vuejs.org/core-plugins/pwa.html#configuration
  pwa: {
    name: '蚁阅',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // https://github.com/GoogleChrome/workbox/releases
      // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
      importWorkboxFrom: 'local',
      importsDirectory: 'libs',
      exclude: [/\.map$/, /^manifest.*\.js$/, /libs\/MathJax-.*$/],
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW
      navigateFallback: publicPath + 'index.html',
      navigateFallbackBlacklist: [/^\/api.*$/, /^\/admin.*$/, /^\/changelog.*$/, /^.*\..*$/],
    },
    // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-plugin-pwa/lib/HtmlPwaPlugin.js
    themeColor: '#f9f9f9',
    msTileColor: '#f9f9f9',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'default',
    assetsVersion: assetsVersion,
    manifestPath: 'manifest.json',
    manifestOptions: {
      start_url: publicPath,
      icons: [
        {
          src: `${publicPath}img/icons/android-chrome-192x192.png${assetsVersionSuffix}`,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: `${publicPath}img/icons/android-chrome-512x512.png${assetsVersionSuffix}`,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      orientation: "portrait",
      background_color: '#ffffff',
    },
    iconPaths: {
      // will auto prefix '/' and auto add assetsVersion
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-150x150.png',
    },
  },
  devServer: {
    port: 6789,
    disableHostCheck: true,
    proxy: {
      '/api/v1/image': {
        target: 'http://127.0.0.1:6786',
      },
      '/api': {
        target: 'http://127.0.0.1:6788',
      },
      '/static': {
        target: 'http://127.0.0.1:6788',
      },
      '/changelog': {
        target: 'http://127.0.0.1:6788',
      },
    },
  },
}
