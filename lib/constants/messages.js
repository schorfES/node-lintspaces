module.exports = {
	INDENTATION_TABS: {
		code: 'INDENTATION_TABS',
		message: 'Unexpected spaces found.'
	},
	INDENTATION_SPACES: {
		code: 'INDENTATION_SPACES',
		message: 'Unexpected tabs found.'
	},
	INDENTATION_SPACES_AMOUNT: {
		code: 'INDENTATION_SPACES_AMOUNT',
		message: 'Expected an indentation at {a} instead of at {b}.'
	},
	TRAILINGSPACES: {
		code: 'TRAILINGSPACES',
		message: 'Unexpected trailing spaces found.'
	},
	NEWLINE: {
		code: 'NEWLINE',
		message: 'Expected a newline at the end of the file.'
	},
	NEWLINE_AMOUNT: {
		code: 'NEWLINE_AMOUNT',
		message: 'Unexpected additional newlines at the end of the file.'
	},
	NEWLINE_MAXIMUM: {
		code: 'NEWLINE_MAXIMUM',
		message: 'Maximum amount of newlines exceeded. Found {a} newlines, expected maximum is {b}.'
	},
	NEWLINE_MAXIMUM_INVALIDVALUE: {
		code: 'NEWLINE_MAXIMUM_INVALIDVALUE',
		message: 'The value "{a}" for the maximum of newlines is invalid.'
	},
	EDITORCONFIG_NOTFOUND: {
		code: 'EDITORCONFIG_NOTFOUND',
		message: 'The config file "{a}" wasn\'t found.'
	},
	PATH_INVALID: {
		code: 'PATH_INVALID',
		message: '"{a}" does not exists.'
	},
	PATH_ISNT_FILE: {
		code: 'PATH_ISNT_FILE',
		message: '"{a}" is not a file.'
	}
};
