const base = require('@open-web3/dev-config/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    '.eslintrc.cjs',
    '.eslintrc.js',
    '.github/**',
    '.vscode/**',
    '.yarn/**',
    '**/build/*',
    '**/coverage/*',
    '**/node_modules/*'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json', './tsconfig.examples.json']
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
