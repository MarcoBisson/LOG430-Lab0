module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    collectCoverageFrom: [
        "src/backend/**/*.ts",
        "!src/backend/**/*.d.ts",
        "!src/backend/server.ts",
        "!src/backend/generate-swagger.ts",
        "!src/backend/swagger.ts"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    setupFilesAfterEnv: ["<rootDir>/tests/mocks/setup/testSetup.ts"],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
