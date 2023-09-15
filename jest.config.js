module.exports = {
  ...require('@energyreach/jest-config'),
  moduleNameMapper: {
    '^-/(.*)': '<rootDir>/src/$1',
  },
};
