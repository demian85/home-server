/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/src/tools/test.ts',
  ],
}
