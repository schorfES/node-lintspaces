module.export = {
	'linters': {
		'*.{js}': ['eslint --fix', 'git add'],
		'*.{json,yml}': ['prettier --write', 'git add'],
	},
};
