const path = require('path');

module.exports = {
    testEnvironment: "jsdom",
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, 'src/$1'),
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.scss$': 'jest-css-modules-transform',
  },
  // Modify this line
  transformIgnorePatterns: [
    'node_modules/(?!(three-stdlib|@babel/runtime/helpers/esm|three))',
  ],
};