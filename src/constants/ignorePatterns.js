const XML_STYLE = /<!--[\s\S]*?-->/gv;
const C_STYLE = /\/\*\*?[\s\S]*?\*\//gv;
const PYTHON = /'''[\s\S]*?'''/gv;
const RUBY = /=begin[\s\S]*?=end/gv;
const APPLESCRIPT = /\(\*[\s\S]*?\*\)/gv;

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
