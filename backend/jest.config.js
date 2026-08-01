/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
};
