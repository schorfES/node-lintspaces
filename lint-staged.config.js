module.export = {
	'linters': {
		'*.{js}': ['eslint --fix', 'git add'],
		'*.{json,yml,md}': ['prettier --write', 'git add'],
	},
};
