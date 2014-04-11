var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('newlines', function() {
	var validator = new Validator({
		newline: true,
		newlineMaximum: 3
	});

	it('fixtures/newlines/valid.txt should have no errors', function() {
		var p = path.join(__dirname, 'fixtures/newlines/valid.txt');

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/newlines/missing.txt should have errors', function() {
		var p = path.join(__dirname, 'fixtures/newlines/missing.txt');

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});

	it('fixtures/newlines/toomuch.txt should have errors', function() {
		var p = path.join(__dirname, 'fixtures/newlines/toomuch.txt');

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
		Object.keys(validator.getInvalidLines(p)).should.be.eql(['8', '17', '31']);
	});

	it('should throw an exception if newlineMaximum is not greater than 0', function() {
		var
			p = __filename,
			validator = new Validator({
				newlineMaximum: 0
			})
		;

		validator.validate.bind(validator, p).should.throw(/for the maximum of newlines is invalid/);
	});
});
