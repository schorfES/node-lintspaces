module.exports = {
	arrowParens: 'always',
	bracketSpacing: false,
	endOfLine: 'lf',
	printWidth: 80,
	semi: true,
	singleQuote: true,
	trailingComma: 'all',
	useTabs: true,
	overrides: [
		'*.json': {
			useTabs: false,
			tabWidth: 2,
		}
	]
}
