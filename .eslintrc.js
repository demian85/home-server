module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-undef': 0,
    '@typescript-eslint/interface-name': 0,
    '@typescript-eslint/object-literal-sort-keys': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/member-access': 0,
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
