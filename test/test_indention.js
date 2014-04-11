var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('indentation', function() {
	describe('tabs', function() {
		var validator = new Validator({
			indentation: 'tabs'
		});

		it('fixtures/indentations/tabs_valid.txt should have no errors', function() {
			var p = path.join(__dirname, 'fixtures/indentations/tabs_valid.txt');

			validator.validate(p);
			validator.getInvalidLines(p).should.be.empty;
		});

		it('fixtures/indentations/tabs_invalid.txt should have no errors', function() {
			var p = path.join(__dirname, 'fixtures/indentations/tabs_invalid.txt');

			validator.validate(p);
			validator.getInvalidLines(p).should.not.be.empty;
		});

		it('should have 2 processed files', function() {
			validator.getProssessedFiles().should.be.equal(2);
		});

		it('should have 1 invalid files', function() {
			Object.keys(validator.getInvalidFiles()).should.have.lengthOf(1);
		});
	});

	describe('spaces', function() {
		var validator = new Validator({
			indentation: 'spaces'
		});

		it('fixtures/indentations/spaces_valid.txt should have no errors', function() {
			var p = path.join(__dirname, 'fixtures/indentations/spaces_valid.txt');

			validator.validate(p);
			validator.getInvalidLines(p).should.be.empty;
		});

		it('fixtures/indentations/spaces_invalid.txt should have no errors', function() {
			var p = path.join(__dirname, 'fixtures/indentations/spaces_invalid.txt');

			validator.validate(p);
			validator.getInvalidLines(p).should.not.be.empty;
		});

		it('should have 2 processed files', function() {
			validator.getProssessedFiles().should.be.equal(2);
		});

		it('should have 1 invalid files', function() {
			Object.keys(validator.getInvalidFiles()).should.have.lengthOf(1);
		});
	});
});
