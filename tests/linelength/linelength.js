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
	'should report errors when line length exceeds 80 chars': function(test) {
		file = __dirname + '/fixures/invalid.js';
		validator = new Validator({linelength: 80});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
			'2': [merge({}, Messages.LINELENGTH, {
				message: Messages
					.LINELENGTH
					.message
					.replace('{a}', 87)
					.replace('{b}', 80),
				line: 2,
				payload: {
					length: 87,
					maximum: 80
				}
			})],
			'7': [merge({}, Messages.LINELENGTH, {
				message: Messages
					.LINELENGTH
					.message
					.replace('{a}', 123)
					.replace('{b}', 80),
				line: 7,
				payload: {
					length: 123,
					maximum: 80
				}
			})]
		};

		test.deepEqual(report, expected);
		test.done();
	},

	'should have no reports when file is valid': function(test) {
		file = __dirname + '/fixures/valid.js';
		validator = new Validator({linelength: 80});
		validator.validate(file);
		report = validator.getInvalidFiles();

		test.deepEqual(report, {});
		test.done();
	}
};
