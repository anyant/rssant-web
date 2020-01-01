module.exports = {
  // https://cli.vuejs.org/core-plugins/pwa.html#configuration
  pwa: {
    name: '蚁阅',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
      importWorkboxFrom: 'local',
      importsDirectory: 'libs',
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
    },
  },
}
