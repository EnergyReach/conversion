module.exports = {
  ...require('@svile/node-development/jest'),
  moduleNameMapper: {
    '^-/(.*)': '<rootDir>/src/$1',
  },
};
