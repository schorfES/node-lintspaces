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
	'Should pass on LF-only files': function (test) {
		file = __dirname + '/fixtures/LF_only.txt';
		validator = new Validator({endOfLine: 'LF'});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		test.deepEqual(report, expected);
		test.done();
	},

	'Should fail on CR-only files': function (test) {
		file = __dirname + '/fixtures/CR_only.txt';
		validator = new Validator({endOfLine: 'LF'});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
		        '1': [extend({}, Messages.END_OF_LINE, {line: 1}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
		        '2': [extend({}, Messages.END_OF_LINE, {line: 2}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
			'3': [extend({}, Messages.END_OF_LINE, {line: 3}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
			'4': [extend({}, Messages.END_OF_LINE, {line: 4}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
			'5': [extend({}, Messages.END_OF_LINE, {line: 5}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
			'6': [extend({}, Messages.END_OF_LINE, {line: 6}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
			'7': [extend({}, Messages.END_OF_LINE, {line: 7}, {payload: {expected: 'LF', end_of_line: 'CR'}})]

		};
		test.deepEqual(report, expected);
		test.done();
	},

	'Should fail on CRLF-only files': function(test) {
		file = __dirname + '/fixtures/CRLF_only.txt';
		validator = new Validator({endOfLine: 'LF'});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
		        '1': [extend({}, Messages.END_OF_LINE, {line: 1}, {payload: {expected: 'LF', end_of_line: 'CRLF'}})],
		        '2': [extend({}, Messages.END_OF_LINE, {line: 2}, {payload: {expected: 'LF', end_of_line: 'CRLF'}})],
		        '3': [extend({}, Messages.END_OF_LINE, {line: 3}, {payload: {expected: 'LF', end_of_line: 'CRLF'}})]
		};
		test.deepEqual(report, expected);
		test.done();
	},

	'Should fail on mixed files': function(test) {
		file = __dirname + '/fixtures/mixed_endings.txt';
		validator = new Validator({endOfLine: 'LF'});
		validator.validate(file);
		report = validator.getInvalidFiles();
		expected = {};
		expected[file] = {
		        '1': [extend({}, Messages.END_OF_LINE, {line: 1}, {payload: {expected: 'LF', end_of_line: 'CR'}})],
		        '3': [extend({}, Messages.END_OF_LINE, {line: 3}, {payload: {expected: 'LF', end_of_line: 'CRLF'}})]
		};
		test.deepEqual(report, expected);
		test.done();
	}
};
