module.exports = {
	encoding: 'utf8',
	newline: false,
	newlineMaximum: false,
	indentation: false, // 'tabs' or 'spaces' or false
	spaces: 4, // Amount of spaces when 'indentation' is set to 'spaces'
	indentationGuess: false, // Guess indentation
	trailingspaces: false,
	trailingspacesToIgnores: false, // ignore trailingspaces in ignored lines
	trailingspacesSkipBlanks: false, // Skip trailingspaces in blank lines
	ignores: false, // Pattern or string for lines to ignore
	editorconfig: false, // Path to editor-config file
	rcconfig: false, // Path to rc-config file
	allowsBOM: false,
	endOfLine: false, // 'LF' or 'CRLF' or 'CR' or false to disable checking
};
