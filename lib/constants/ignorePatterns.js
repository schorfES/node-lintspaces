const XML_STYLE = /<!--[\s\S]*?-->/g;
const C_STYLE = /\/\*\*?[\s\S@{}]*?\*\//g;
const PYTHON = /'''[\s\S]*?'''/g;
const RUBY = /=begin[\s\S]*?=end/g;
const APPLESCRIPT = /\(\*[\s\S]*?\*\)/g;

module.exports = {
	'xml-comments': XML_STYLE,
	'html-comments': XML_STYLE,
	'c-comments': C_STYLE,
	'java-comments': C_STYLE,
	'js-comments': C_STYLE,
	'as-comments': C_STYLE,
	'python-comments': PYTHON,
	'ruby-comments': RUBY,
	'applescript-comments': APPLESCRIPT,
};
