import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import configXo from 'eslint-config-xo';
import configJest from 'eslint-plugin-jest';

export default defineConfig([
	{languageOptions: {globals: {...globals.node}}},
	...configXo({space: false, semicolon: true}),
	{
		files: ['**/*.test.*'],
		languageOptions: {globals: {...globals.jest}},
		...configJest.configs['flat/recommended'],
		...configJest.configs['flat/style'],
	},
	{
		rules: {
			'max-depth': ['warn', 6],
			'max-nested-callbacks': ['warn', 6],
			'package-json/prefer-exports': ['off'],
			'package-json/prefer-type-module': ['off'],
			'unicorn/filename-case': ['off'],
			'unicorn/prefer-module': ['off'],
			'unicorn/prefer-private-class-fields': ['off'],
		},
	},
	globalIgnores([
		'coverage/',
		'example/',
		'tests/',
		'package-lock.json',
	]),
]);
