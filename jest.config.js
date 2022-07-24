/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*.js'],
  coverageDirectory: 'coverage',
  testEnvironment: 'Node',
  coverageProvider: 'v8',
  preset: '@shelf/jest-mongodb'
}
