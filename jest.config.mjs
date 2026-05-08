import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: [
    "<rootDir>/node_modules",
    "<rootDir>/components",
    "<rootDir>/lib",
  ],
  modulePathIgnorePatterns: ["<rootDir>/cdk/"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  // Do not add globs with ** here; Jest merges these into a RegExp and ** breaks it.
  // Keep tests out of pages/ anyway — Next treats that directory as routes.
  testPathIgnorePatterns: [
    "<rootDir>/cypress",
    "<rootDir>/docker",
    "<rootDir>/node_modules/",
    "<rootDir>/public",
    "<rootDir>/styles",
    "<rootDir>/cdk/",
  ],
  transformIgnorePatterns: ["/node_modules/(?!marked)/"],
};

export default createJestConfig(customJestConfig);
