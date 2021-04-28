/**
 * This file contains contants for reports and exceptions.
 */

const TYPES = require('./types');

module.exports = {
	// Reports:
	// Reports always should contain
	//  * code (unique error code)
	//  * type (warning or hint)
	//  * message (the message)
	// -------------------------------------------------------------------------
	INDENTATION_TABS: {
		code: 'INDENTATION_TABS',
		type: TYPES.WARNING,
		message: 'Unexpected spaces found.',
	},
	INDENTATION_SPACES: {
		code: 'INDENTATION_SPACES',
		type: TYPES.WARNING,
		message: 'Unexpected tabs found.',
	},
	INDENTATION_SPACES_AMOUNT: {
		code: 'INDENTATION_SPACES_AMOUNT',
		type: TYPES.WARNING,
		message: 'Expected an indentation at {a} instead of at {b}.',
	},
	INDENTATION_GUESS: {
		type: TYPES.HINT,
		code: 'NEWLINE_GUESS',
		message: 'The indentation in this line seems to be incorrect. ' +
			'The expected indention is {a}, but {b} was found.',
	},
	TRAILINGSPACES: {
		code: 'TRAILINGSPACES',
		type: TYPES.WARNING,
		message: 'Unexpected trailing spaces found.',
	},
	NEWLINE: {
		code: 'NEWLINE',
		type: TYPES.WARNING,
		message: 'Expected a newline at the end of the file.',
	},
	NEWLINE_AMOUNT: {
		code: 'NEWLINE_AMOUNT',
		type: TYPES.WARNING,
		message: 'Unexpected additional newlines at the end of the file.',
	},
	NEWLINE_MAXIMUM: {
		code: 'NEWLINE_MAXIMUM',
		type: TYPES.WARNING,
		message: 'Maximum amount of newlines exceeded. Found {a} newlines, ' +
			'expected maximum is {b}.',
	},
	NEWLINE_MAXIMUM_INVALIDVALUE: {
		type: TYPES.WARNING,
		code: 'NEWLINE_MAXIMUM_INVALIDVALUE',
		message: 'The value "{a}" for the maximum of newlines is invalid.',
	},
	END_OF_LINE: {
		code: 'END_OF_LINE',
		type: TYPES.WARNING,
		message: 'Incorrect end of line character(s) found.',
	},

	// Exceptions:
	// -------------------------------------------------------------------------
	EDITORCONFIG_NOTFOUND: {
		message: 'The editorconfig file "{a}" wasn\'t found.',
	},
	RCCONFIG_NOTFOUND: {
		message: 'The rcconfig file "{a}" wasn\'t found.',
	},
	PATH_INVALID: {
		message: '"{a}" does not exists.',
	},
	PATH_ISNT_FILE: {
		message: '"{a}" is not a file.',
	},
};
