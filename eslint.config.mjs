import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import ConfigXo from 'eslint-config-xo';
import ConfigJest from 'eslint-plugin-jest';

export default defineConfig([
	{languageOptions: {globals: {...globals.node}}},
	...ConfigXo,
	{
		files: ['**/*.test.*'],
		languageOptions: {globals: {...globals.jest}},
		...ConfigJest.configs['flat/recommended'],
		...ConfigJest.configs['flat/style'],
	},
	{
		rules: {
			'max-depth': ['warn', 6],
			'max-nested-callbacks': ['warn', 6],
		},
	},
	globalIgnores([
		'coverage/',
		'example/',
		'tests/',
		'package-lock.json',
	]),
]);
