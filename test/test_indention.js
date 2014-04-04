var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('indentation', function() {
	it('fixtures/indentations/tabs_valid.txt should have no errors', function() {
		var
			validator = new Validator({
				indentation: 'tabs'
			}),
			p = path.join(__dirname, 'fixtures/indentations/tabs_valid.txt')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/indentations/tabs_invalid.txt should have no errors', function() {
		var
			validator = new Validator({
				indentation: 'tabs'
			}),
			p = path.join(__dirname, 'fixtures/indentations/tabs_invalid.txt')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});

	it('fixtures/indentations/spaces_valid.txt should have no errors', function() {
		var
			validator = new Validator({
				indentation: 'spaces'
			}),
			p = path.join(__dirname, 'fixtures/indentations/spaces_valid.txt')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/indentations/spaces_invalid.txt should have no errors', function() {
		var
			validator = new Validator({
				indentation: 'spaces'
			}),
			p = path.join(__dirname, 'fixtures/indentations/spaces_invalid.txt')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});
});
