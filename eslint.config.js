import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', '*.min.js'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // All React source files
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react:           reactPlugin,
      'react-hooks':   reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType:  'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types':         'off',
      'react/display-name':       'warn',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console':     ['warn', { allow: ['warn', 'error'] }],
      'no-undef':       'error',
      'prefer-const':   'warn',
      'no-var':         'error',
    },
  },

  // shadcn/ui components export both components + variant helpers — turn off HMR warning
  {
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]
