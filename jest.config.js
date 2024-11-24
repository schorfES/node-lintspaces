// https://jestjs.io/docs/en/configuration.html
module.exports = {
	clearMocks: true,
	coverageDirectory: "coverage",
	testEnvironment: "node",
	preset: 'ts-jest',
	testMatch: ['src/**/*.test.{js,ts}'],
	moduleFileExtensions: ['ts', 'js'],
};
