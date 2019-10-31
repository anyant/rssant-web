module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    'prettier',
  ],
  "globals": {
    "MathJax": "readonly",
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // ignore non-camelcase
    'camelcase': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
