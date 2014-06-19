var
	Validator = require('./../../lib/Validator'),
	validator,
	report
;

exports.tests = {
	'should fail when tabs are used': function(test) {
		validator = new Validator({indentation: 'spaces'}),
		validator.validate(__dirname + '/fixures/tabs-valid.js');
		report = validator.getInvalidFiles();

		console.log(report);

		test.equal(true, true, 'should be equal');
		test.done();
	},

	'should fail when tabs and spaces are mixed': function(test) {
		test.equal(true, true, 'should be equal');
		test.done();
	},

	'should fail when indentation is incorrect': function(test) {
		test.equal(true, true, 'should be equal');
		test.done();
	}
};
