module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    './jest.setup.js'
  ],
  moduleNameMapper: {
    '~(.*)': '<rootDir>/$1'
  },
}
