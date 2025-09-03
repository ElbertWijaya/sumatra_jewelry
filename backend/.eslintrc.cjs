module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.json'], tsconfigRootDir: __dirname },
  env: { node: true, es2021: true },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {},
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
  }
};
