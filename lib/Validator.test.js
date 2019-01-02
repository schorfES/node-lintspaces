const
	fs = require('fs'),
	path = require('path'),

	Defaults = require('./constants/defaults'),
	Messages = require('./constants/messages'),
	Validator = require('./Validator'),

	__fromFixtures = (...args) => path.join.apply(null, [__dirname, '__fixtures__'].concat(args))
;


describe('The validator', () => {

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

			it('should throw an exception if is not a file', () => {
				const file = __fromFixtures('file.example');
				[
					'.',
					__dirname
				].forEach((rcconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', rcconfig);
					const error = new Error(message);
					expect(() => new Validator({rcconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw an exception if does not exist', () => {
				const file = __fromFixtures('file.example');
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
				validator._path = __fromFixtures('file.example');
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
				validator._path = __fromFixtures('file.example');
				validator._loadSettings();
				expect(validator._settings.trailingspaces).toBeFalsy();
				expect(validator._settings.newline).toBeFalsy();
				expect(validator._settings.endOfLine).toBe('lf');

				// Load editorconfig with extension where options are enabled:
				validator._path = __fromFixtures('file.other-example');
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
				validator._path = __fromFixtures('file.other-example');
				validator._loadSettings();

				// test for expected properties by editorconfig:
				expect(validator._settings.indentation).toBe('tabs');
				expect(validator._settings.spaces).toBe('tab');
				expect(validator._settings.trailingspaces).toBeTruthy();
				expect(validator._settings.newline).toBeTruthy();
			});

			it('should throw an exception if is not a file', () => {
				const file = __fromFixtures('file.example');
				[
					'.',
					__dirname
				].forEach((editorconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', editorconfig);
					const error = new Error(message);
					expect(() => new Validator({editorconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw an exception if does not exist', () => {
				const file = __fromFixtures('file.example');
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

});
