module.exports = {
	charset: {
		name: 'encoding',
		types: ['string'],
		regexp: /^latin1|utf-8|utf8|utf-16le|utf16le$/iv,
	},
	// This would cause a BREAKING CHANGE and might change in an later version:
	// eslint-disable-next-line camelcase
	insert_final_newline: {
		name: 'newline',
		types: ['boolean'],
		regexp: false,
	},

	// This would cause a BREAKING CHANGE and might change in an later version:
	// eslint-disable-next-line camelcase
	indent_style: {
		name: 'indentation',
		types: ['string'],
		regexp: /^tab|space$/iv,
	},

	// This would cause a BREAKING CHANGE and might change in an later version:
	// eslint-disable-next-line camelcase
	indent_size: {
		name: 'spaces',
		types: ['number'],
		regexp: false,
	},

	// This would cause a BREAKING CHANGE and might change in an later version:
	// eslint-disable-next-line camelcase
	trim_trailing_whitespace: {
		name: 'trailingspaces',
		types: ['boolean'],
		regexp: false,
	},

	// This would cause a BREAKING CHANGE and might change in an later version:
	// eslint-disable-next-line camelcase
	end_of_line: {
		name: 'endOfLine',
		types: ['string'],
		regexp: /^lf|crlf|cr$/iv,
	},
};
