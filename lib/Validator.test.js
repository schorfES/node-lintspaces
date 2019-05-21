const
	extend = require('deep-extend'),
	fs = require('fs'),
	path = require('path'),

	Defaults = require('./constants/defaults'),
	Messages = require('./constants/messages'),
	Validator = require('./Validator'),

	__fromFixtures = (...args) => path.join.apply(null, [__dirname, '__fixtures__'].concat(args))
;


describe('The validator', () => {

	// Core
	// -------------------------------------------------------------------------
	describe('core', () => {

		it('should export appname', () => {
			expect(Validator.APPNAME).toBe('lintspaces');
		});

		it('should export defaults', () => {
			expect(Validator.DEFAULTS).toEqual(Defaults);
		});

		it('should throw if file does not exist', () => {
			const
				validator = new Validator({trailingspaces: true}),
				cases = [path.join('this', 'file', 'does', 'not', 'exists.js')]
			;

			cases.forEach((file) => {
				const message = Messages.PATH_INVALID.message.replace('{a}', file);
				const error = new Error(message);
				expect(() => validator.validate(file)).toThrow(error);
			});
		});

		it('should throw if file is not a file', () => {
			const
				validator = new Validator({trailingspaces: true}),
				cases = [
					'.',
					__dirname,
					__fromFixtures()
				]
			;

			cases.forEach((file) => {
				const message = Messages.PATH_ISNT_FILE.message.replace('{a}', file);
				const error = new Error(message);
				expect(() => validator.validate(file)).toThrow(error);
			});

		});

		describe('rcconfig', () => {

			it('should override settings', () => {
				// fake loading:
				const validator = new Validator({
					trailingspaces: false,
					newlineMaximum: false,
					indentation: 'tabs',
					spaces: 'tab',
					newline: true,
					ignores: ['js-comments'],
					rcconfig: __fromFixtures('.lintspacesrc')
				});
				validator._path = __filename;
				validator._loadSettings();

				expect(validator._settings.trailingspaces).toBeFalsy();
				expect(validator._settings.newline).toBeFalsy();
				expect(validator._settings.indentation).toBe('spaces');
				expect(validator._settings.spaces).toBe(4);

				// Unchanged:
				expect(validator._settings.newlineMaximum).toBe(false);
				expect(validator._settings.ignores).toEqual(['js-comments']);
			});

			it('should load by appname', () => {
				const config = path.join(__dirname, '..', `.${Validator.APPNAME}rc`);

				// create config file:
				fs.writeFileSync(config, JSON.stringify({
					indentation: 'spaces',
					trailingspaces: true
				}));

				// fake loading:
				const validator = new Validator({rcconfig: true});
				validator._path = __filename;
				validator._loadSettings();

				expect(validator._settings.indentation).toBe('spaces');
				expect(validator._settings.trailingspaces).toBeTruthy();

				// remove config file:
				fs.unlinkSync(config);
			});

			it('should throw if is not a file', () => {
				const file = __fromFixtures('file.core.example');
				[
					'.',
					__dirname
				].forEach((rcconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', rcconfig);
					const error = new Error(message);
					expect(() => new Validator({rcconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw if file does not exist', () => {
				const file = __fromFixtures('file.core.example');
				[
					path.join(__dirname, 'path', 'that', 'doesnt', 'existis', '.rcconfig')
				].forEach((rcconfig) => {
					const message = Messages.RCCONFIG_NOTFOUND.message.replace('{a}', rcconfig);
					const error = new Error(message);
					expect(() => new Validator({rcconfig}).validate(file)).toThrow(error);
				});
			});

		});

		describe('editorconfig', () => {

			it('should override settings', () => {
				// fake loading:
				const validator = new Validator({
					editorconfig: __fromFixtures('.editorconfig'),

					trailingspaces: true,
					newline: true,

					indentation: 'spaces',
					spaces: 2,
					endOfLine: false,

					newlineMaximum: false,
					ignores: ['js-comments']
				});
				validator._path = __fromFixtures('file.core.example');
				validator._loadSettings();

				expect(validator._settings.trailingspaces).toBeFalsy();
				expect(validator._settings.newline).toBeFalsy();
				expect(validator._settings.indentation).toBe('tabs');
				expect(validator._settings.spaces).toBe('tab');
				expect(validator._settings.endOfLine).toBe('lf');

				// Unchanged:
				expect(validator._settings.newlineMaximum).toBe(false);
				expect(validator._settings.ignores).toEqual(['js-comments']);
			});

			it('should load specific settings by extension', () => {
				// fake loading:
				const validator = new Validator({
					editorconfig: __fromFixtures('.editorconfig'),

					trailingspaces: true,
					newline: true,

					indentation: 'spaces',
					spaces: 2,
					endOfLine: false,

					newlineMaximum: false,
					ignores: ['js-comments']
				});

				// Load editorconfig with extension where options are disabled:
				validator._path = __fromFixtures('file.core.example');
				validator._loadSettings();
				expect(validator._settings.trailingspaces).toBeFalsy();
				expect(validator._settings.newline).toBeFalsy();
				expect(validator._settings.endOfLine).toBe('lf');

				// Load editorconfig with extension where options are enabled:
				validator._path = __fromFixtures('file.corer.other-example');
				validator._loadSettings();
				expect(validator._settings.trailingspaces).toBeTruthy();
				expect(validator._settings.newline).toBeTruthy();
				expect(validator._settings.endOfLine).toBe('crlf');
			});

			it('should be more relevant than rcconfig', () => {
				// fake loading:
				const validator = new Validator({
					rcconfig: __fromFixtures('.lintspacesrc'),
					editorconfig: __fromFixtures('.editorconfig'),
					newline: 'foo'
				});
				validator._path = __fromFixtures('file.corer.other-example');
				validator._loadSettings();

				// test for expected properties by editorconfig:
				expect(validator._settings.indentation).toBe('tabs');
				expect(validator._settings.spaces).toBe('tab');
				expect(validator._settings.trailingspaces).toBeTruthy();
				expect(validator._settings.newline).toBeTruthy();
			});

			it('should throw if is not a file', () => {
				const file = __fromFixtures('file.core.example');
				[
					'.',
					__dirname
				].forEach((editorconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', editorconfig);
					const error = new Error(message);
					expect(() => new Validator({editorconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw if file does not exist', () => {
				const file = __fromFixtures('file.core.example');
				[
					path.join(__dirname, 'path', 'that', 'doesnt', 'existis', '.editorconfig')
				].forEach((editorconfig) => {
					const message = Messages.EDITORCONFIG_NOTFOUND.message.replace('{a}', editorconfig);
					const error = new Error(message);
					expect(() => new Validator({editorconfig}).validate(file)).toThrow(error);
				});
			});

		});

	});

	// Validations
	// -------------------------------------------------------------------------
	describe('validations', () => {

		// End of line
		// ---------------------------------------------------------------------
		describe('end of line', () => {

			describe('carriage return', () => {

				it('should pass', () => {
					const file = __fromFixtures('file.endofline.cr.example');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on line feed files', () => {
					const file = __fromFixtures('file.endofline.lf.example');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					const payload = {expected: 'CR', end_of_line: 'LF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})],
							'4': [extend({}, defaults, {line: 4})],
							'5': [extend({}, defaults, {line: 5})],
							'6': [extend({}, defaults, {line: 6})],
							'7': [extend({}, defaults, {line: 7})]
						}
					});
				});

				it('should fail on carriage return line feed files', () => {
					const file = __fromFixtures('file.endofline.crlf.example');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					const payload = {expected: 'CR', end_of_line: 'CRLF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})]
						}
					});
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('file.endofline.mixed.example');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					const payload = {expected: 'CR'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'2': [extend({}, defaults, {line: 2}, {payload: {end_of_line: 'LF'}})],
							'3': [extend({}, defaults, {line: 3}, {payload: {end_of_line: 'CRLF'}})]
						}
					});
				});

			});

			describe('line feed', () => {

				it('should pass', () => {
					const file = __fromFixtures('file.endofline.lf.example');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on carriage return files', () => {
					const file = __fromFixtures('file.endofline.cr.example');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					const payload = {expected: 'LF', end_of_line: 'CR'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})],
							'4': [extend({}, defaults, {line: 4})],
							'5': [extend({}, defaults, {line: 5})],
							'6': [extend({}, defaults, {line: 6})],
							'7': [extend({}, defaults, {line: 7})]
						}
					});
				});

				it('should fail on carriage return line feed files', () => {
					const file = __fromFixtures('file.endofline.crlf.example');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					const payload = {expected: 'LF', end_of_line: 'CRLF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})]
						}
					});
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('file.endofline.mixed.example');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					const payload = {expected: 'LF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1}, {payload: {end_of_line: 'CR'}})],
							'3': [extend({}, defaults, {line: 3}, {payload: {end_of_line: 'CRLF'}})]
						}
					});
				});

			});

			describe('carriage return, line feed', () => {

				it('should pass', () => {
					const file = __fromFixtures('file.endofline.crlf.example');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on carriage return files', () => {
					const file = __fromFixtures('file.endofline.cr.example');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					const payload = {expected: 'CRLF', end_of_line: 'CR'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})],
							'4': [extend({}, defaults, {line: 4})],
							'5': [extend({}, defaults, {line: 5})],
							'6': [extend({}, defaults, {line: 6})],
							'7': [extend({}, defaults, {line: 7})]
						}
					});
				});

				it('should fail on line feed files', () => {
					const file = __fromFixtures('file.endofline.lf.example');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					const payload = {expected: 'CRLF', end_of_line: 'LF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1})],
							'2': [extend({}, defaults, {line: 2})],
							'3': [extend({}, defaults, {line: 3})],
							'4': [extend({}, defaults, {line: 4})],
							'5': [extend({}, defaults, {line: 5})],
							'6': [extend({}, defaults, {line: 6})],
							'7': [extend({}, defaults, {line: 7})]
						}
					});
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('file.endofline.mixed.example');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					const payload = {expected: 'CRLF'};
					const defaults = extend({payload}, Messages.END_OF_LINE);
					expect(validator.getInvalidFiles()).toEqual({
						[file]: {
							'1': [extend({}, defaults, {line: 1}, {payload: {end_of_line: 'CR'}})],
							'2': [extend({}, defaults, {line: 2}, {payload: {end_of_line: 'LF'}})]
						}
					});
				});

			});

		});

		// Trailing spaces
		// ---------------------------------------------------------------------
		describe('trailingspaces', () => {

			it('should pass', () => {
				const file = __fromFixtures('file.trailingspaces.valid.example');
				const validator = new Validator({trailingspaces: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report errors', () => {
				const file = __fromFixtures('file.trailingspaces.invalid.example');
				const validator = new Validator({trailingspaces: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'2': [extend({}, Messages.TRAILINGSPACES, {line: 2})],
						'5': [extend({}, Messages.TRAILINGSPACES, {line: 5})],
						'8': [extend({}, Messages.TRAILINGSPACES, {line: 8})]
					}
				});
			});

			it('should ignore comments', () => {
				const file = __fromFixtures('file.trailingspaces.ignores.example');
				const validator = new Validator({
					trailingspaces: true,
					trailingspacesToIgnores: true,
					ignores: ['js-comments']
				});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'9': [extend({}, Messages.TRAILINGSPACES, {line: 9})], // singleline
						'11': [extend({}, Messages.TRAILINGSPACES, {line: 11})], // singleline
						'15': [extend({}, Messages.TRAILINGSPACES, {line: 15})], // multiline
						'17': [extend({}, Messages.TRAILINGSPACES, {line: 17})], // singleline
						'21': [extend({}, Messages.TRAILINGSPACES, {line: 21})], // multiline
						'26': [extend({}, Messages.TRAILINGSPACES, {line: 26})] // multiline
					}
				});
			});

			it('should skip blank lines', () => {
				const file = __fromFixtures('file.trailingspaces.invalid.example');
				const validator = new Validator({
					trailingspaces: true,
					trailingspacesSkipBlanks: true
				});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'2': [extend({}, Messages.TRAILINGSPACES, {line: 2})],
						'8': [extend({}, Messages.TRAILINGSPACES, {line: 8})]
					}
				});
			});

		});

		// Newline (at the end of file)
		// ---------------------------------------------------------------------
		describe('newline (at the end of file)', () => {

			it('should pass', () => {
				const file = __fromFixtures('file.newlines.endoffile.valid.example');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report missing', () => {
				const file = __fromFixtures('file.newlines.endoffile.invalid.less.example');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'8': [extend({}, Messages.NEWLINE, {line: 8})]
					}
				});
			});

			it('should report too much', () => {
				const file = __fromFixtures('file.newlines.endoffile.invalid.much.example');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'12': [extend({}, Messages.NEWLINE_AMOUNT, {line: 12})]
					}
				});
			});

		});

		// Newlines maximum
		// ---------------------------------------------------------------------
		describe('newlines maximum', () => {

			it('should pass', () => {
				const file = __fromFixtures('file.newlines.blocks.example');
				const validator = new Validator({newlineMaximum: 4});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report errors', () => {
				const file = __fromFixtures('file.newlines.blocks.example');
				const validator = new Validator({newlineMaximum: 2});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({
					[file]: {
						'8': [extend({}, Messages.NEWLINE_MAXIMUM, {
							message: Messages.NEWLINE_MAXIMUM
								.message
								.replace('{a}', 3)
								.replace('{b}', 2),
							line: 8,
							payload: {
								amount: 3,
								maximum: 2
							}
						})],
						'16': [extend({}, Messages.NEWLINE_MAXIMUM, {
							message: Messages.NEWLINE_MAXIMUM
								.message
								.replace('{a}', 4)
								.replace('{b}', 2),
							line: 16,
							payload: {
								amount: 4,
								maximum: 2
							}
						})]
					}
				});
			});

			it('should throw if newlineMaximum is less than 0', () => {
				const file = __fromFixtures('file.newlines.blocks.example');
				const validator = new Validator({newlineMaximum: -2});

				expect(() => validator.validate(file)).toThrow(Error);
			});

		});

	});

});
