import autoImports from './.wxt/eslint-auto-imports.mjs'

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...autoImports,
  root: true,
  extends: ['@repo/eslint-config/base.js'],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  overrides: [
    // Node
    {
      files: ['.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
}
