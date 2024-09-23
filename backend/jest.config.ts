import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/index.ts",
    "!src/db/seed.ts",
    "!src/db/schema.ts"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};

export default config;