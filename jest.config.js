module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '\\.mobile\\.test\\.(ts|tsx)$', '\\.web\\.test\\.(ts|tsx)$'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.mobile.test.ts',
    '!src/**/*.web.test.ts',
    '!src/**/*.web.test.tsx',
    '!src/**/*.tsx',
    '!src/setupTests.ts',
    '!src/setupTests.mobile.ts',
    '!src/setupTests.web.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library/react-native)/)'
  ]
};