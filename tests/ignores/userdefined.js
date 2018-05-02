var
	extend = require('deep-extend'),
	Messages = require('./../../lib/constants/messages'),
	Validator = require('./../../lib/Validator'),
	validator,
	report,
	expected,
	file
;

exports.tests = {
	'should fail, when no ignore is set': function(test) {
		file = __dirname + '/fixures/userdefined.txt';
		validator = new Validator({
			indentation: 'tabs',
			trailingspaces: true
		});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
			'1': [extend({}, Messages.INDENTATION_TABS, {line: 1})],
			'4': [extend({}, Messages.INDENTATION_TABS, {line: 4})],
			'6': [extend({}, Messages.INDENTATION_TABS, {line: 6})],
			'7': [
				extend({}, Messages.INDENTATION_TABS, {line: 7}),
				extend({}, Messages.TRAILINGSPACES, {line: 7})
			],
			'10': [extend({}, Messages.INDENTATION_TABS, {line: 10})],
			'11': [extend({}, Messages.INDENTATION_TABS, {line: 11})],
			'12': [extend({}, Messages.INDENTATION_TABS, {line: 12})],
			'13': [extend({}, Messages.INDENTATION_TABS, {line: 13})]
		};

		test.deepEqual(report, expected);
		test.done();
	},

	'should fail, when ignore is set': function(test) {
		file = __dirname + '/fixures/userdefined.txt';
		validator = new Validator({
			indentation: 'tabs',
			trailingspaces: true,
			ignores: [
				/<comment>[\s\S]*?<\/comment>/g
			]
		});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
			'1': [extend({}, Messages.INDENTATION_TABS, {line: 1})],
			'4': [extend({}, Messages.INDENTATION_TABS, {line: 4})],
			'7': [extend({}, Messages.TRAILINGSPACES, {line: 7})],
			'10': [extend({}, Messages.INDENTATION_TABS, {line: 10})],
			'11': [extend({}, Messages.INDENTATION_TABS, {line: 11})]
		};

		test.deepEqual(report, expected);
		test.done();
	}
};
