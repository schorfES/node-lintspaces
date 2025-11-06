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
		...ConfigJest.configs['flat/all'],
	},
	globalIgnores([
		'coverage/',
		'example/',
		'tests/',
	]),
]);
