/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/base.js'],
  env: {
    node: true,
    browser: true,
  },
}
