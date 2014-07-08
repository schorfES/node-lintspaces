var
	DEFAULTS = require('./constants/defaults'),
	MESSAGES = require('./constants/messages'),
	PATTERNS = require('./constants/ignorePatterns'),
	MAPPINGS = require('./constants/editorconfig-mappings'),

	eol = '\\r?\\n',
	eolRegExp = new RegExp(eol),

	fs = require('fs'),
	merge = require('merge'),
	editorconfig = require('editorconfig')
;

/**
 * @constructor
 * @param {Object} options
 */
var Validator = function(options) {
	this._options = merge({}, DEFAULTS, options || {});
	this._processedFiles = 0;
	this._invalid = {};
};

// Externalize constants:
Validator.DEFAULTS = DEFAULTS;
Validator.MESSAGES = MESSAGES;
Validator.PATTERNS = PATTERNS;

/**
 * Check if a file is valid based on validation settings
 * @param {String} path Path to file
 */
Validator.prototype.validate = function(path) {
	var self = this, stat;

	try {
		stat = fs.statSync(path);
	} catch(e) {
		this._fail(MESSAGES.PATH_INVALID.replace(
			'{a}',
			path
		));
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

		// Validate single lines:
		this._lines.forEach(function(line, index) {
			self._validateIndentation(line, index);
			self._validateTrailingspaces(line, index);
		});

		// Validation is done:
		this._done();
	} else {
		this._fail(MESSAGES.PATH_ISNT_FILE.replace(
			'{a}',
			path
		));
	}
};

/**
 * Get count of processed files
 * @return {Number}
 */
Validator.prototype.getProcessedFiles = function() {
	return this._processedFiles;
};

/**
 * After validation
 * @private
 */
Validator.prototype._done = function() {
	this._processedFiles++;
	this._cleanUp();
};

/**
 * Reset references
 * @private
 */
Validator.prototype._cleanUp = function() {
	this._settings = null;
	this._data = undefined;
	this._lines = null;
	this._ignoredLines = null;
};

/**
 * Load file data
 * @private
 */
Validator.prototype._loadFile = function() {
	this._data = fs.readFileSync(this._path, this._settings.encoding);
	this._lines = this._data.split(eolRegExp);
};

/**
 * Load settings
 * @private
 */
Validator.prototype._loadSettings = function() {
	var config, key;

	// Initially the users options are the current settings:
	this._settings = merge({}, this._options);

	// Overwrite settings by .editorconfig file's settings:
	if (typeof this._settings.editorconfig === 'string') {
		var stat;

		try {
			stat = fs.statSync(this._settings.editorconfig);
		} catch(e) {
			this._fail(
				MESSAGES.EDITORCONFIG_NOTFOUND.replace(
					'{a}',
					this._settings.editorconfig
				)
			);
		}

		if (stat.isFile()) {
			// Load config for current path
			config = editorconfig.parse(
				this._path, {
					config: this._settings.editorconfig
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
				MESSAGES.PATH_ISNT_FILE.replace(
					'{a}',
					this._settings.editorconfig
				)
			);
		}
	}
};

/**
 * Load ignores
 * @private
 */
Validator.prototype._loadIgnores = function() {
	var
		self = this,
		ignores = []
	;

	this._ignoredLines = {};

	// Load ignore patterns:
	if (Array.isArray(this._settings.ignores)) {
		this._settings.ignores.forEach(function(ignore) {
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
		ignores.forEach(function(expression) {

			var matches = self._data.match(expression) || [];

			matches.forEach(function(match) {

				// Only perform an action when match has more
				// than one line:
				if (eolRegExp.test(match)) {

					// Use fake replace cycle to find indices of all
					// lines to be ignored. Return unchanged match:
					self._data = self._data.replace(match, function(matched) {
						var
							index = 1,
							args,
							indexOfMatch,
							indexOfSecondLine,
							totalLines
						;

						// last argument is whole string, remove it:
						args = Array.prototype.slice.call(arguments);
						args.pop();

						// matched string start index:
						indexOfMatch = args.pop();

						// slice source data from beginning to matched
						// string start index to find index of second
						// line to be ignored:
						indexOfSecondLine = self._data.slice(0, indexOfMatch).split(eolRegExp).length;
						totalLines = matched.split(eolRegExp).length;

						//Count and store lines:
						while (index < totalLines) {
							self._ignoredLines[indexOfSecondLine + index - 1] = true;
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
};

/**
 * Check the maximum of newlines
 * @private
 */
Validator.prototype._validateNewlineMaximum = function() {
	if (typeof this._settings.newlineMaximum === 'number') {
		if (this._settings.newlineMaximum > 0) {
			var
				self = this,

				// To grep all all blocks at the begin of a file
				// which have at least 1 more new line than the defined
				// criteria the expression for one or more newlines is
				// appended:
				newlinesAtBeginn = '^[' + eol + ']{' + this._settings.newlineMaximum + '}' + eol + '+',

				// Each block inside a file has an extra leading newline
				// from the previous line above (+1). To grep all all blocks
				// which have at least 1 more new line than the defined
				// criteria the expression for one or more newlines is
				// appended:
				newlinesInFile = '[' + eol + ']{' + (this._settings.newlineMaximum + 1) + '}' + eol + '+',

				// Define function which is used as fake replace cycle to
				// validate matches:
				validate = function(match, offset, original) {
					var
						substring = original.substr(0, offset),
						newlines = substring.match(new RegExp(eol, 'g')),
						amount = match.match(new RegExp(eol, 'g')).length,
						atLine = 0
					;

					// When current match is not at the beginning of a file,
					// newlines is defined. In this case update variables:
					if (newlines) {
						atLine = newlines.length + 1;
						amount = amount - 1;
					}

					// Test if found lines are not in ignored lines:
					if (!self._ignoredLines[atLine + 1]) {
						self._invalidate(
							atLine + 1,
							MESSAGES.NEWLINE_MAXIMUM
								.replace('{a}', amount)
								.replace('{b}', self._settings.newlineMaximum)
						);
					}

					return original;
				}
			;

			this._data.replace(new RegExp(newlinesAtBeginn, 'g'), validate);
			this._data.replace(new RegExp(newlinesInFile, 'g'), validate);
		} else {
			this._fail(
				MESSAGES.NEWLINE_MAXIMUM_INVALIDVALUE.replace('{a}', this._settings.newlineMaximum)
			);
		}
	}
};

/**
 * Check newlines of the end of file
 * @private
 */
Validator.prototype._validateNewlinesEOF = function() {
	if (this._settings.newline && this._lines.length > 1) {
		var
			index = this._lines.length - 1
		;


		// check last line:
		if (this._lines[index].length > 0) {
			this._invalidate(index + 1, MESSAGES.NEWLINE);
		}

		// check line before last line:
		if (this._lines[index - 1].length === 0) {
			this._invalidate(index, MESSAGES.NEWLINE_AMOUNT);
		}
	}
};

/**
 * Check trailing spaces
 * @private
 */
Validator.prototype._validateTrailingspaces = function(line, index) {
	if (this._settings.trailingspaces && !this._ignoredLines[index] && typeof line === 'string') {
		var reg = this._settings.trailingspaces === 'ignore empty' ? /\S\s+$/ : /\s+$/;
		if (reg.test(line)) {
			this._invalidate(index + 1, MESSAGES.TRAILINGSPACES);
		}
	}
};

/**
 * Check indentations
 * @private
 */
Validator.prototype._validateIndentation = function(line, index) {
	if (!this._ignoredLines[index] &&
		typeof this._settings.indentation === 'string' &&
		typeof line === 'string') {

		var
			tabsRegExp = /^\t*(?!\s).*$/, // leading tabs without leading spaces
			spacesRegExp = /^ *(?!\s).*$/, // leading spaces without leading tabs
			spacesLeadingRegExp = /^( *).*$/,
			spacesExpected,
			indent,
			message
		;

		switch (this._settings.indentation) {
			case 'tabs':
				if (!tabsRegExp.test(line)) {
					// indentation failed...
					return this._invalidate(index + 1, MESSAGES.INDENTATION_TABS);
				}
				break;

			case 'spaces':
				if (!spacesRegExp.test(line)) {
					// Indentation failed...
					this._invalidate(index + 1, MESSAGES.INDENTATION_SPACES);
				} else {
					// Indentation correct, is amount of spaces correct?
					if (typeof this._settings.spaces === 'number') {
						indent = line.match(spacesLeadingRegExp)[1].length;
						if (indent % this._settings.spaces !== 0) {
							// Indentation incorrect, create message:
							spacesExpected = Math.round(indent / this._settings.spaces) * this._settings.spaces;
							message = MESSAGES.INDENTATION_SPACES_AMOUNT
								.replace('{a}', spacesExpected)
								.replace('{b}', indent);

							this._invalidate(index + 1, message);
						}
					}
				}
				break;
		}
	}
};

/**
 * Throw an exception
 * @param  {String} message Exception message
 * @private
 */
Validator.prototype._fail = function(message) {
	throw new Error(message);
};

/**
 * Add an invalid line
 * @param  {Number} linenumber Line number
 * @param  {String} message    Error message
 */
Validator.prototype._invalidate = function(linenumber, message) {
	var file, line;

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

	// Store given message:
	line.push(message);
};

/**
 * Get invalid lines by path
 * @param  {String} path
 * @return {Object} each key in the returned object represents a line from the
 * file of the given path, each value an exeption message of the current line.
 */
Validator.prototype.getInvalidLines = function(path) {
	if(!this._invalid[path]) {
		return {};
	}

	return this._invalid[path];
};

/**
 * Get a all invalid lines and messages from processed files.
 * @return {Object} each key in the returned object represents a path of a
 * processed invalid file. Each value is an other object
 * containing the validation result.
 */
Validator.prototype.getInvalidFiles = function() {
	return this._invalid;
};

// Expose Validator:
module.exports = Validator;
