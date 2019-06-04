const
	fs = require('fs'),
	path = require('path'),

	Defaults = require('./constants/defaults'),
	Messages = require('./constants/messages'),
	Validator = require('./Validator'),

	__fromFixtures = (...args) => path.join.apply(null, ['lib', '__fixtures__'].concat(args))
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
					path.join(process.cwd(), 'lib'),
					__fromFixtures('core.dir'),
				]
			;

			cases.forEach((file) => {
				const location = path.relative(process.cwd(), file);
				const message = Messages.PATH_ISNT_FILE.message.replace('{a}', location);
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
					rcconfig: __fromFixtures('.lintspacesrc'),
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
					trailingspaces: true,
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
				const file = __fromFixtures('core.fixture');
				[
					'.',
					__dirname,
				].forEach((rcconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', rcconfig);
					const error = new Error(message);
					expect(() => new Validator({rcconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw if file does not exist', () => {
				const file = __fromFixtures('core.fixture');
				[
					path.join(__dirname, 'path', 'that', 'doesnt', 'existis', '.rcconfig'),
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
					ignores: ['js-comments'],
				});
				validator._path = __fromFixtures('core.fixture');
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
					ignores: ['js-comments'],
				});

				// Load editorconfig with extension where options are disabled:
				validator._path = __fromFixtures('core.fixture');
				validator._loadSettings();
				expect(validator._settings.trailingspaces).toBeFalsy();
				expect(validator._settings.newline).toBeFalsy();
				expect(validator._settings.endOfLine).toBe('lf');

				// Load editorconfig with extension where options are enabled:
				validator._path = __fromFixtures('corer.other-fixture');
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
					newline: 'foo',
				});
				validator._path = __fromFixtures('corer.other-fixture');
				validator._loadSettings();

				// test for expected properties by editorconfig:
				expect(validator._settings.indentation).toBe('tabs');
				expect(validator._settings.spaces).toBe('tab');
				expect(validator._settings.trailingspaces).toBeTruthy();
				expect(validator._settings.newline).toBeTruthy();
			});

			it('should throw if is not a file', () => {
				const file = __fromFixtures('core.fixture');
				[
					'.',
					__dirname,
				].forEach((editorconfig) => {
					const message = Messages.PATH_ISNT_FILE.message.replace('{a}', editorconfig);
					const error = new Error(message);
					expect(() => new Validator({editorconfig}).validate(file)).toThrow(error);
				});
			});

			it('should throw if file does not exist', () => {
				const file = __fromFixtures('core.fixture');
				[
					path.join(__dirname, 'path', 'that', 'doesnt', 'existis', '.editorconfig'),
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
					const file = __fromFixtures('endofline.cr.fixture');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on line feed files', () => {
					const file = __fromFixtures('endofline.lf.fixture');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on carriage return line feed files', () => {
					const file = __fromFixtures('endofline.crlf.fixture');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('endofline.mixed.fixture');
					const validator = new Validator({endOfLine: 'CR'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

			describe('line feed', () => {

				it('should pass', () => {
					const file = __fromFixtures('endofline.lf.fixture');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on carriage return files', () => {
					const file = __fromFixtures('endofline.cr.fixture');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on carriage return line feed files', () => {
					const file = __fromFixtures('endofline.crlf.fixture');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('endofline.mixed.fixture');
					const validator = new Validator({endOfLine: 'LF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

			describe('carriage return, line feed', () => {

				it('should pass', () => {
					const file = __fromFixtures('endofline.crlf.fixture');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should fail on carriage return files', () => {
					const file = __fromFixtures('endofline.cr.fixture');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on line feed files', () => {
					const file = __fromFixtures('endofline.lf.fixture');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should fail on mixed files', () => {
					const file = __fromFixtures('endofline.mixed.fixture');
					const validator = new Validator({endOfLine: 'CRLF'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

		});

		// Indentation
		// ---------------------------------------------------------------------
		describe('indentation', () => {

			describe('tabs', () => {

				it('should pass', () => {
					const file = __fromFixtures('indentation.tabs.fixture');
					const validator = new Validator({indentation: 'tabs'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should report spaces', () => {
					const file = __fromFixtures('indentation.mixed.fixture');
					const validator = new Validator({indentation: 'tabs'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should pass file with allowed BOM', () => {
					const file = __fromFixtures('indentation.tabs.bom.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						allowsBOM: true,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should report file with disallowed BOM', () => {
					const file = __fromFixtures('indentation.tabs.bom.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						allowsBOM: false,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

			describe('spaces', () => {

				it('should pass', () => {
					const file = __fromFixtures('indentation.spaces.fixture');
					const validator = new Validator({indentation: 'spaces'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should report tabs', () => {
					const file = __fromFixtures('indentation.tabs.fixture');
					const validator = new Validator({indentation: 'spaces'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should report mixed', () => {
					const file = __fromFixtures('indentation.mixed.fixture');
					const validator = new Validator({indentation: 'spaces'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should report incorrect', () => {
					const file = __fromFixtures('indentation.spaces.invalid.fixture');
					const validator = new Validator({
						indentation: 'spaces',
						spaces: 4,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should pass file with allowed BOM', () => {
					const file = __fromFixtures('indentation.spaces.bom.fixture');
					const validator = new Validator({
						indentation: 'spaces',
						allowsBOM: true,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toEqual({});
				});

				it('should report file with disallowed BOM', () => {
					const file = __fromFixtures('indentation.spaces.bom.fixture');
					const validator = new Validator({
						indentation: 'spaces',
						allowsBOM: false,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

			describe('guess', () => {

				it('should guess incorrect using tabs', () => {
					const file = __fromFixtures('indentation.guess.tabs.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						indentationGuess: true,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should guess incorrect using spaces', () => {
					const file = __fromFixtures('indentation.guess.spaces.fixture');
					const validator = new Validator({
						indentation: 'spaces',
						spaces: 4,
						indentationGuess: true,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should skip newlines', () => {
					const file = __fromFixtures('indentation.guess.newline.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						indentationGuess: true,
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should be silent', () => {
					const file = __fromFixtures('indentation.guess.tabs.fixture');
					const validator = new Validator({indentation: 'spaces'});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

		});

		// Trailing spaces
		// ---------------------------------------------------------------------
		describe('trailingspaces', () => {

			it('should pass', () => {
				const file = __fromFixtures('trailingspaces.valid.fixture');
				const validator = new Validator({trailingspaces: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report errors', () => {
				const file = __fromFixtures('trailingspaces.invalid.fixture');
				const validator = new Validator({trailingspaces: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

			it('should ignore comments', () => {
				const file = __fromFixtures('trailingspaces.ignores.fixture');
				const validator = new Validator({
					trailingspaces: true,
					trailingspacesToIgnores: true,
					ignores: ['js-comments'],
				});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

			it('should skip blank lines', () => {
				const file = __fromFixtures('trailingspaces.invalid.fixture');
				const validator = new Validator({
					trailingspaces: true,
					trailingspacesSkipBlanks: true,
				});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

		});

		// Newline (at the end of file)
		// ---------------------------------------------------------------------
		describe('newline (at the end of file)', () => {

			it('should pass', () => {
				const file = __fromFixtures('newlines.endoffile.valid.fixture');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report missing', () => {
				const file = __fromFixtures('newlines.endoffile.invalid.less.fixture');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

			it('should report too much', () => {
				const file = __fromFixtures('newlines.endoffile.invalid.much.fixture');
				const validator = new Validator({newline: true});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

		});

		// Newlines maximum
		// ---------------------------------------------------------------------
		describe('newlines maximum', () => {

			it('should pass', () => {
				const file = __fromFixtures('newlines.blocks.fixture');
				const validator = new Validator({newlineMaximum: 4});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toEqual({});
			});

			it('should report errors', () => {
				const file = __fromFixtures('newlines.blocks.fixture');
				const validator = new Validator({newlineMaximum: 2});
				validator.validate(file);

				expect(validator.getInvalidFiles()).toMatchSnapshot();
			});

			it('should throw if newlineMaximum is less than 0', () => {
				const file = __fromFixtures('newlines.blocks.fixture');
				const validator = new Validator({newlineMaximum: -2});

				expect(() => validator.validate(file)).toThrow(Error);
			});

		});

		// Ignores
		// ---------------------------------------------------------------------
		describe('ignores', () => {

			describe('build in', () => {

				it('should ignore indentaion', () => {
					const file = __fromFixtures('ignores.buildin.js.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						ignores: ['js-comments'],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should ignore trailingspaces', () => {
					const file = __fromFixtures('ignores.buildin.js.fixture');
					const validator = new Validator({
						trailingspaces: true,
						ignores: ['js-comments'],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should ignore newlines', () => {
					const file = __fromFixtures('ignores.buildin.js.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						trailingspaces: true,
						newlineMaximum: 2,
						ignores: ['js-comments'],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

			describe('user defined', () => {

				it('should ignore indentaion', () => {
					const file = __fromFixtures('ignores.userdefined.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						ignores: [
							/<comment>[\s\S]*?<\/comment>/g,
						],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should ignore trailingspaces', () => {
					const file = __fromFixtures('ignores.userdefined.fixture');
					const validator = new Validator({
						trailingspaces: true,
						ignores: [
							/<comment>[\s\S]*?<\/comment>/g,
						],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

				it('should ignore newlines', () => {
					const file = __fromFixtures('ignores.userdefined.fixture');
					const validator = new Validator({
						indentation: 'tabs',
						trailingspaces: true,
						newlineMaximum: 2,
						ignores: [
							/<comment>[\s\S]*?<\/comment>/g,
						],
					});
					validator.validate(file);

					expect(validator.getInvalidFiles()).toMatchSnapshot();
				});

			});

		});

	});

});
