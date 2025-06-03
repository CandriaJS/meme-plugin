import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const globals = require('globals')
const neostandard = require('neostandard')

export default (
  {
    ignores: [ 'eslint.config.js' ]
  },
  {
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node }
    },
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    files: [ '**/*.js', 'eslint.config.js' ],
    rules: {
      ...neostandard.rules,
      'no-prototype-builtins': 0,
      'no-unsafe-optional-chaining': 0,
      'no-useless-escape': 0,
      'prefer-regex-literals': 0,
      'line-comment-position': 'off',
      'quotes': [ 1, 'single' ],
      'camelcase': 'off',
      'eqeqeq': [ 1, 'always' ],
      'prefer-const': 'off',
      'comma-dangle': [ 1, {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      } ],
      'arrow-body-style': 'off',
      'indent': [ 1, 2, { 'SwitchCase': 1 } ],
      'space-before-function-paren': 1,
      'semi': [ 2, 'never' ],
      'no-trailing-spaces': 1,
      'object-curly-spacing': [ 1, 'always' ],
      'array-bracket-spacing': [ 1, 'always' ],
      'no-multiple-empty-lines': [ 1, { max: 2, maxEOF: 0, maxBOF: 0 } ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'comma-spacing': [ 1, { before: false, after: true } ],
      'key-spacing': [ 1, { beforeColon: false, afterColon: true } ],
      'space-infix-ops': 1,
      'space-unary-ops': [ 1, {
        words: true,
        nonwords: false
      } ],
      'space-before-blocks': [ 1, 'always' ],
      'space-in-parens': [ 1, 'never' ],
      'keyword-spacing': [ 1, {
        before: true,
        after: true,
        overrides: {
          if: { after: true }
        }
      } ],
      'brace-style': [ 1, '1tbs' ]
    }
  }
)
