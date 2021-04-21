const fs = require('fs');
const rc = require('rc');
const extend = require('deep-extend');
const editorconfig = require('editorconfig');

const DEFAULTS = extend({}, require('./constants/defaults'));
const MESSAGES = require('./constants/messages');
const PATTERNS = require('./constants/ignorePatterns');
const MAPPINGS = require('./constants/editorconfig-mappings');

const ValidationError = require('./ValidationError');

// Constants:
const APPNAME = 'lintspaces';

// Regular Expressions:
const EOF = '\\r?\\n';
const REGEXP_EOL = new RegExp(EOF);

const REGEXP_INDENTATION_TABS = /^\t*(?!\s).*$/; // leading tabs without leading spaces
const REGEXP_INDENTATION_TABS_WITH_BOM = /^\t*(?! |\t).*$/; // leading tabs without leading spaces (allows BOM)
const REGEXP_INDENTATION_SPACES = /^ *(?!\s).*$/; // leading spaces without leading tabs
const REGEXP_INDENTATION_SPACES_WITH_BOM = /^ *(?!\t).*$/; // leading spaces without leading tabs (allows BOM)

const REGEXP_LEADING_TABS = /^(\t*).*$/; // leading tabs
const REGEXP_LEADING_SPACES = /^( *).*$/; // leading spaces

/**
 * The lintspaces validator.
 */
class Validator {

	static get APPNAME() {
		return APPNAME;
	}

	static get DEFAULTS() {
		return DEFAULTS;
	}

	static get MESSAGES() {
		return MESSAGES;
	}

	static get PATTERNS() {
		return PATTERNS;
	}

	// Public API
	// -------------------------------------------------------------------------

	/**
	 * @constructor
	 * @param {Object} options
	 */
	constructor(options = {}) {
		this._options = extend({}, DEFAULTS, options);
		this._processedFiles = [];
		this._invalid = {};
	}

	/**
	 * Check if a file is valid based on validation settings
	 * @param {String} path Path to file
	 */
	validate(path) {
		let stat;

		try {
			stat = fs.statSync(path);
		} catch(e) {
			this._fail(
				MESSAGES.PATH_INVALID.message
					.replace('{a}', path)
			);
		}

		if (stat.isFile()) {
			this._cleanUp();

			// Load file, settings & ignores:
			this._path = path;
			this._loadSettings();
			this._loadFile();
			this._loadIgnores();

			// Validate total file:
			this._validateNewlineMaximum();
			this._validateNewlinesEOF();
			this._validateEndOfLine();

			// Validate single lines:
			this._lines.forEach((line, index) => {
				this._validateIndentation(line, index);
				this._validateTrailingspaces(line, index);
			});

			// Validation is done:
			this._done();
		} else {
			this._fail(
				MESSAGES.PATH_ISNT_FILE.message
					.replace('{a}', path)
			);
		}
	}

	/**
	 * Get a all invalid lines and messages from processed files.
	 * @return {Object} each key in the returned object represents a path of a
	 * processed invalid file. Each value is an other object
	 * containing the validation result.
	 */
	getInvalidFiles() {
		return this._invalid;
	}

	/**
	 * Get count of processed files
	 * @return {Number}
	 */
	getProcessedFiles() {
		return this._processedFiles.length;
	}

	/**
	 * Get invalid lines by path
	 * @param {String} path
	 * @return {Object} each key in the returned object represents a line from the
	 * file of the given path, each value an exeption message of the current line.
	 */
	getInvalidLines(path) {
		return this._invalid[path] || {};
	}

	// Private API
	// -------------------------------------------------------------------------

	/**
	 * After validation
	 * @private
	 */
	_done() {
		if (!this._processedFiles.includes(this._path)) {
			this._processedFiles.push(this._path);
		}
		this._cleanUp();
	}

	/**
	 * Reset references
	 * @private
	 */
	_cleanUp() {
		this._path = null;
		this._settings = null;
		this._data = undefined;
		this._lines = null;
		this._ignoredLines = null;
	}

	/**
	 * Load file data
	 * @private
	 */
	_loadFile() {
		this._data = fs.readFileSync(this._path, this._settings.encoding);
		this._lines = this._data.split(REGEXP_EOL);
	}

	/**
	 * Load settings
	 * @private
	 */
	_loadSettings() {
		// Initially the users options are the current settings:
		this._settings = extend({}, this._options);
		this._loadSettingsRCconfig();
		this._loadSettingsEditorconfig();
	}

	/**
	 * Overwrite settings by .lintspacesrc file's settings
	 * @private
	 */
	_loadSettingsRCconfig() {
		let stat;

		if (this._settings.rcconfig) {
			switch (typeof this._settings.rcconfig) {
				case 'boolean':
					// Lookup for config file by APPNAME:
					this._settings = rc(APPNAME, this._settings);
					break;

				case 'string':
					// Lookup for config file by path:
					try {
						stat = fs.statSync(this._settings.rcconfig);
					} catch(e) {
						this._fail(
							MESSAGES.RCCONFIG_NOTFOUND.message
								.replace('{a}', this._settings.rcconfig)
						);
					}

					if (stat.isFile()) {
						this._settings = rc(
							APPNAME,
							this._settings,
							{config: this._settings.rcconfig}
						);
					} else {
						this._fail(
							MESSAGES.PATH_ISNT_FILE.message
								.replace('{a}', this._settings.rcconfig)
						);
					}
					break;
			}
		}
	}

	/**
	 * Overwrite settings by .editorconfig file's settings
	 * @private
	 */
	_loadSettingsEditorconfig() {
		let config;
		let key;
		let stat;

		if (typeof this._settings.editorconfig === 'string') {
			try {
				stat = fs.statSync(this._settings.editorconfig);
			} catch(e) {
				this._fail(
					MESSAGES.EDITORCONFIG_NOTFOUND.message
						.replace('{a}', this._settings.editorconfig)
				);
			}

			if (stat.isFile()) {
				// Load config for current path
				//
				// To work on windows, the config path should be relative to the
				// current cwd. See: Issue #40
				const relative = this._settings.editorconfig.replace(process.cwd(), '');
				config = editorconfig.parseSync(
					this._path, {
						config: relative,
					}
				);

				if (typeof config === 'object') {
					// Merge editorconfig values into the correct settings names:
					for (key in config) {
						if (typeof MAPPINGS[key] === 'string') {
							switch (key) {
								case 'indent_style':
									// The 'indent_style' property value isn't
									// equal to the expected setting value:
									this._settings[MAPPINGS[key]] = config[key] + 's';
									break;
								default:
									this._settings[MAPPINGS[key]] = config[key];
									break;
							}
						}
					}
				}
			} else {
				this._fail(
					MESSAGES.PATH_ISNT_FILE.message
						.replace('{a}', this._settings.editorconfig)
				);
			}
		}
	}

	/**
	 * Load ignores
	 * @private
	 */
	_loadIgnores() {
		let ignores = [];

		this._ignoredLines = {};

		// Load ignore patterns:
		if (Array.isArray(this._settings.ignores)) {
			this._settings.ignores.forEach((ignore) => {
				if (typeof ignore === 'string' && typeof PATTERNS[ignore] === 'object') {
					ignores.push(PATTERNS[ignore]);
				} else if (typeof ignore === 'object' && typeof ignore.test === 'function') {
					ignores.push(ignore);
				}
			});
		}

		// When no patterns are defined, disable the following search for lines:
		if (ignores.length === 0) {
			ignores = false;
		}

		// Index lines which match patterns, when available:
		if (Array.isArray(ignores)) {

			// Loop all given regular expressions:
			ignores.forEach((expression) => {

				const matches = this._data.match(expression) || [];

				matches.forEach((match) => {

					// Only perform an action when match has more
					// than one line:
					if (REGEXP_EOL.test(match)) {

						// Use fake replace cycle to find indices of all
						// lines to be ignored. Return unchanged match:
						this._data = this._data.replace(match, (matched, ...args) => {
							let index = 1;
							let indexOfMatch;
							let indexOfSecondLine;
							let totalLines;

							// last argument is whole string, remove it:
							args.pop();

							// matched string start index:
							indexOfMatch = args.pop();

							// slice source data from beginning to matched
							// string start index to find index of second
							// line to be ignored:
							indexOfSecondLine = this._data.slice(0, indexOfMatch).split(REGEXP_EOL).length;
							totalLines = matched.split(REGEXP_EOL).length;

							//Count and store lines:
							while (index < totalLines) {
								this._ignoredLines[indexOfSecondLine + index - 1] = true;
								index++;
							}

							// Fillup result with linebreaks and overwrite
							// data string in case that the data string contains
							// the current 'matched' more than once:
							return Array(totalLines).join('\n');
						});

					}
				});
			});
		}
	}

	/**
	 * Check the maximum of newlines
	 * @private
	 */
	_validateNewlineMaximum() {
		if (typeof this._settings.newlineMaximum === 'number') {
			if (this._settings.newlineMaximum > 0) {
				// To grep all blocks at the begining of a file
				// which have at least 1 more new line than the defined
				// criteria, match "newlineMaximum + 1" (or more) instances of eol:
				const newlinesAtBeginn = '^(?:' + EOF + '){' + (this._settings.newlineMaximum + 1) + ',}';

				// Each block inside a file has an extra leading newline
				// from the previous line above. To grep all blocks
				// which have at least 1 more new line than the defined criteria,
				// match "newlineMaximum + 2" (or more) instances of eol:
				const newlinesInFile = '(?:' + EOF + '){' + (this._settings.newlineMaximum + 2) + ',}';

				// Define function which is used as fake replace cycle to
				// validate matches:
				const validate = (match, offset, original) => {
					const substring = original.substr(0, offset);
					const newlines = substring.match(new RegExp(EOF, 'g'));
					let amount = match.match(new RegExp(EOF, 'g')).length;
					let atLine = 0;
					let message;
					let data;
					let line;
					let payload;
					let fromLine;
					let toLine;
					let foundIgnore;

					// When current match is not at the beginning of a file,
					// newlines is defined. In this case update variables:
					if (newlines) {
						atLine = newlines.length + 1;
						amount = amount - 1;
					}

					// Test if found lines are not in ignored lines:
					fromLine = atLine;
					toLine = atLine + amount;
					foundIgnore = false;
					while (fromLine <= toLine) {
						// Is the current line in ignored lines?...
						if (this._ignoredLines[fromLine]) {
							// ...yes, reuduce amount of found newlines
							// save flag that there are at least one line in
							// ignored lines...
							foundIgnore = true;
							amount--;
						}
						fromLine++;
					}

					// If there is at least one line listed in ignored lines,
					// we have to reduce the amount of found new lines because
					// an ignored line (or multinewline block) has an following
					// newline sign at the end which should not be counted as
					// linebreak in this validation...
					if (foundIgnore) {
						amount--;
					}

					if (amount > this._settings.newlineMaximum) {

						// Build message and report:
						message = MESSAGES.NEWLINE_MAXIMUM.message
							.replace('{a}', amount)
							.replace('{b}', this._settings.newlineMaximum);

						data = {message: message};
						data = extend({}, MESSAGES.NEWLINE_MAXIMUM, data);
						line = atLine + 1;
						payload = {
							amount: amount,
							maximum: this._settings.newlineMaximum,
						};

						this._report(data, line, payload);
					}

					return original;
				}

				this._data.replace(new RegExp(newlinesAtBeginn, 'g'), validate);
				this._data.replace(new RegExp(newlinesInFile, 'g'), validate);
			} else {
				this._fail(
					MESSAGES.NEWLINE_MAXIMUM_INVALIDVALUE.message
						.replace('{a}', this._settings.newlineMaximum)
				);
			}
		}
	}

	/**
	 * Check newlines of the end of file
	 * @private
	 */
	_validateNewlinesEOF() {
		if (!this._settings.newline) {
			return;
		}

		const index = this._lines.length - 1;

		// check last line:
		if (this._lines[index].length > 0) {
			this._report(MESSAGES.NEWLINE, index + 1);
		}

		// check line before last line:
		if (index - 1 > 0 && this._lines[index - 1].length === 0) {
			this._report(MESSAGES.NEWLINE_AMOUNT, index + 1);
		}
	}

	/**
	 * Check trailing spaces
	 * @private
	 */
	_validateTrailingspaces(line, index) {
		if (this._settings.trailingspaces && typeof line === 'string') {
			const matchSpaces = line.match(/\s*$/);

			// Is there a trailing whitespace?
			if (matchSpaces.length > 0 && matchSpaces[0].length > 0) {

				// Check the options if trainlingspaces should be ignored and the
				// current line is inside the ignored lines: stop reporting!
				//
				// NOTE: the '+1' at the _ignoredLines property is necessary because
				// on how the 'ignored lines' options work. The are shifted by +1.
				if (this._options.trailingspacesToIgnores && this._ignoredLines[index + 1]) {
					return;
				}

				// Check is empty lines should not be reported and
				// skipped when empty:
				if (this._options.trailingspacesSkipBlanks && line.trim() === '') {
					return;
				}

				this._report(MESSAGES.TRAILINGSPACES, index + 1);
			}
		}
	}

	/**
	 * Check indentations
	 * @private
	 */
	_validateIndentation(line, index) {
		if (!this._ignoredLines[index] &&
			typeof this._settings.indentation === 'string' &&
			typeof line === 'string') {

			const tabsRegExpFinal = this._settings.allowsBOM
				? REGEXP_INDENTATION_TABS_WITH_BOM
				: REGEXP_INDENTATION_TABS;
			const spacesRegExpFinal = this._settings.allowsBOM
				? REGEXP_INDENTATION_SPACES_WITH_BOM
				: REGEXP_INDENTATION_SPACES;

			let spacesExpected;
			let indent;
			let message;
			let data;
			let payload;

			switch (this._settings.indentation) {
				case 'tabs':
					if (!tabsRegExpFinal.test(line)) {
						// indentation failed...
						return this._report(MESSAGES.INDENTATION_TABS, index + 1);
					}

					this._guessIndentation(line, index);
					break;

				case 'spaces':
					if (!spacesRegExpFinal.test(line)) {
						// Indentation failed...
						this._report(MESSAGES.INDENTATION_SPACES, index + 1);
					} else {
						// Indentation correct, is amount of spaces correct?
						if (typeof this._settings.spaces === 'number') {
							indent = line.match(REGEXP_LEADING_SPACES)[1].length;
							if (indent % this._settings.spaces !== 0) {
								// Indentation incorrect, create message and report:
								spacesExpected = Math.round(indent / this._settings.spaces) * this._settings.spaces;
								message = MESSAGES.INDENTATION_SPACES_AMOUNT.message
									.replace('{a}', spacesExpected)
									.replace('{b}', indent);

								data = {message: message};
								data = extend({}, MESSAGES.INDENTATION_SPACES_AMOUNT, data);
								payload = {
									expected: spacesExpected,
									indent: indent,
								};

								this._report(data, index + 1, payload);
							}
						}
					}

					this._guessIndentation(line, index);
					break;
			}
		}
	}

	/**
	 * Try to guess the indentation of the given line.
	 * @private
	 */
	_guessIndentation(line, index) {
		if (!this._ignoredLines[index] &&
			this._settings.indentationGuess &&
			this._settings.indentation) {

			const regExp = this._settings.indentation === 'tabs'
				? REGEXP_LEADING_TABS
				: REGEXP_LEADING_SPACES;

			let indentation;
			let match = line.match(regExp);
			let matchPrevious = 0;
			let indentationPrevious;
			let message;
			let data;
			let n = 1;

			// Get amount of whitespaces at the beginnig of a line for the
			// current line and the previous line:
			match = match.length > 1 ? match[1].length : 0;
			while (index >= n && matchPrevious === 0) {
				matchPrevious = this._lines[index - n].match(regExp);
				matchPrevious = matchPrevious.length > 1 ? matchPrevious[1].length : 0;
				n++;
			}
			// Calculate the indentation for both lines:
			indentation = match;
			indentationPrevious = matchPrevious;
			if (this._settings.indentation === 'spaces') {
				indentation = match / this._settings.spaces;
				indentationPrevious = matchPrevious / this._settings.spaces;
			}

			// Check if indentations has no decimal values which would be an
			// invalid indentation:
			if (indentation % 1 !== 0 || indentationPrevious % 1 !== 0) {
				// Stop indentation guessing for this line...
				return;
			}

			// The indentation of the current line is correct when:
			// * the amount of indentations is equal to the previous or
			// * the amount of indentations is one less than the previous line or
			// * the amount of indentations is one more than the previous line
			// * the amount of indentations is zero and the lines length is also
			//   zero which is an empty line without trailing whitespaces
			if (indentation - indentationPrevious <= 1) {
				// Valid, nothing to report...
				return;
			}

			// report:
			message = MESSAGES.INDENTATION_GUESS.message
				.replace('{a}', indentationPrevious + 1)
				.replace('{b}', indentation);


			data = {message: message};
			data = extend({}, MESSAGES.INDENTATION_GUESS, data);

			this._report(data, index + 1, {
				indentation: indentation,
				expected: indentationPrevious + 1,
			});
		}
	}

	/**
	 * Check line endings
	 * @private
	 */
	_validateEndOfLine() {
		if (typeof this._settings.endOfLine === 'string') {
			const isEOL = (ch) => ch === '\r' || ch === '\n';

			let desiredEOL = '\n';
			let atLine = 1;
			let pos = 0;
			let aCharacter;
			let totalEOL;
			let payload;

			switch (this._settings.endOfLine.toUpperCase()) {
				case 'CR':
					desiredEOL = '\r';
					break;
				case 'LF':
					desiredEOL = '\n';
					break;
				case 'CRLF':
					desiredEOL = '\r\n';
					break;
			}

			for (pos = 0; pos < this._data.length; pos++) {
				aCharacter = this._data[pos];
				if (isEOL(aCharacter)) {
					if (aCharacter === '\r' && this._data.length > pos + 1 && this._data[pos + 1] === '\n') {
						totalEOL = aCharacter + this._data[pos + 1];
						pos++;
					} else {
						totalEOL = aCharacter;
					}
					if (totalEOL !== desiredEOL) {
						payload = {
							expected: this._settings.endOfLine,
							end_of_line: totalEOL.replace('\r', 'CR').replace('\n', 'LF'),
						};

						this._report(MESSAGES.END_OF_LINE, atLine, payload);
					}

					atLine++;
				}
			}
		}
	}

	/**
	 * Throw an exception
	 * @param {String} message Exception message
	 * @private
	 */
	_fail(message) {
		throw new Error(message);
	}

	/**
	 * Add an invalid line
	 * @param {Object} data Data message and errocode
	 * @param {Number} linenumber where error appeared
	 * @param {String} payload Optional data for the validation error
	 */
	_report(data, linenumber, payload) {
		let line;
		let file;
		let validationError;

		// Build dataset, aware to not overwrite the given data:
		data = extend({}, data);
		data.line = linenumber;

		// Lookup for current file:
		if (!this._invalid[this._path]) {
			this._invalid[this._path] = {};
		}
		file = this._invalid[this._path];

		// Lookup for given line:
		if (!file[linenumber]) {
			file[linenumber] = [];
		}
		line = file[linenumber];

		// Build error:
		validationError = new ValidationError(data, payload);

		// Store error:
		line.push(validationError);
	}

}

module.exports = Validator;
