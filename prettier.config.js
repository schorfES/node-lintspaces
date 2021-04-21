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
		{
			files: '*.json',
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: '*.md',
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 120,
			},
		},
	],
}
