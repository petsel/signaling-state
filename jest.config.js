module.exports = {
  // The test environment that will be used for testing
  testEnvironment: "jest-environment-node",
  // testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['./src/**/*.js'],
  // The directory where Jest should output its coverage files
  coverageDirectory: './reports/coverage',
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel",
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json", "text", 'text-summary', "lcov", "clover", 'html'
  ],
};
