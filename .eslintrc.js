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
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    // ignore non-camelcase
    camelcase: 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // not need force
    'prefer-const': 'off',
    'dot-notation': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
