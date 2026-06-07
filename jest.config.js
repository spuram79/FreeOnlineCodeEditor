/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@features/(.*)$": "<rootDir>/features/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^marked$": "<rootDir>/__mocks__/marked.js",
  },
  testMatch: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "!**/node_modules/**",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowJs: true,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "features/**/*.{ts,tsx}",
    "shared/**/*.{ts,tsx}",
    "!features/**/*.d.ts",
    "!features/**/*.test.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testPathIgnorePatterns: ["<rootDir>/app/api/db/sessions/route.test.ts"],
};

module.exports = config;