module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.mobile\\.test\\.(ts|tsx)$'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.mobile.test.ts',
    '!src/**/*.tsx',
    '!src/setupTests.ts',
    '!src/setupTests.mobile.ts'
  ]
};