var
	merge = require('merge'),
	Messages = require('./../../lib/constants/messages'),
	Validator = require('./../../lib/Validator'),
	validator,
	report,
	expected,
	file
;

exports.tests = {
	'should report errors when trailingspaces found': function(test) {
		file = __dirname + '/fixures/invalid.js';
		validator = new Validator({trailingspaces: true});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
			'2': [merge({}, Messages.TRAILINGSPACES, {line: 2})],
			'5': [merge({}, Messages.TRAILINGSPACES, {line: 5})],
			'8': [merge({}, Messages.TRAILINGSPACES, {line: 8})]
		};

		test.deepEqual(report, expected);
		test.done();
	},

	'should have no reports when file is valid': function(test) {
		file = __dirname + '/fixures/valid.js';
		validator = new Validator({trailingspaces: true});
		validator.validate(file);
		report = validator.getInvalidFiles();

		test.deepEqual({}, report);
		test.done();
	}
};
