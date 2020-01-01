module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['plugin:vue/essential', '@vue/standard', 'prettier'],
  globals: { MathJax: 'readonly' },
  rules: {
    // not allow console and debugger
    'no-console': 'error',
    'no-debugger': 'error',
    // ignore non-camelcase
    camelcase: 'off',
    // allow async-await
    'generator-star-spacing': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
