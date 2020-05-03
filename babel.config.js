module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    'lodash',
    [
      'import',
      {
        libraryName: 'muse-ui',
        libraryDirectory: 'lib',
        camel2DashComponentName: false,
      },
    ],
  ],
}
