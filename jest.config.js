/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup-tests.ts"],
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "@lib/(.*)": "<rootDir>/src/lib/$1",
    "@components/(.*)": "<rootDir>/src/app/components/$1",
    "@test/(.*)": "<rootDir>/tests/$1",
    "\\.(css)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
  },
};
