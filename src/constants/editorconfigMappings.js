module.exports = {
	charset: {
		name: 'encoding',
		types: ['string'],
		regexp: /^.*$/,
	},
	insert_final_newline: {
		name: 'newline',
		types: ['boolean'],
		regexp: false,
	},
	indent_style: {
		name: 'indentation',
		types: ['string'],
		regexp: /^tab|space$/i,
	},
	indent_size: {
		name: 'spaces',
		types: ['number'],
		regexp: false,
	},
	trim_trailing_whitespace: {
		name: 'trailingspaces',
		types: ['boolean'],
		regexp: false,
	},
	end_of_line: {
		name: 'endOfLine',
		types: ['string'],
		regexp: /^lf|crlf|cr$/i,
	},
};
