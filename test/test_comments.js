var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('comments', function() {
	it('fixtures/comments/javascript.js should have no errors', function() {
		var
			validator = new Validator({
				indentation: 'tabs',
				ignores: ['js-comments', 'py-comments']
			}),
			p = path.join(__dirname, 'fixtures/comments/javascript.js')
		;

		validator.validate(p);
		var invalidLines = validator.getInvalidLines(p);
		Object.keys(invalidLines).should.be.eql(['32','46','54']);
	});

	it('fixtures/comments/python.py should have no errors', function() {
		var
			validator = new Validator({
				ignores: ['py-comments']
			}),
			p = path.join(__dirname, 'fixtures/comments/python.py')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/comments/xml.xml should have no errors', function() {
		var
			validator = new Validator({
				ignores: ['xml-comments']
			}),
			p = path.join(__dirname, 'fixtures/comments/xml.xml')
		;

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/comments/custom.txt should ignore <comment></comment>', function() {
		var
			validator = new Validator({
				indentation: 'spaces',
				spaces: 4,
				ignores: [
					/\<comment\>[\s\S]*?\<\/comment\>/g
				]
			}),
			p = path.join(__dirname, 'fixtures/comments/custom.txt')
		;

		validator.validate(p);
		Object.keys(validator.getInvalidLines(p)).should.be.eql(['2', '4']);
	});
});
