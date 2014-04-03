var
	path 		= require("path"),
	should 		= require("should"),
	Validator	= require("../index")
;

describe('newlines', function() {
	var validator = new Validator({
		newline: true
	});

	it('fixtures/newlines/valid.txt should have no errors', function() {
		var p = path.join(__dirname, "fixtures/newlines/valid.txt");

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('fixtures/newlines/missing.txt should have errors', function() {
		var p = path.join(__dirname, "fixtures/newlines/missing.txt");

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});

	it('fixtures/newlines/toomuch.txt should have errors', function() {
		var p = path.join(__dirname, "fixtures/newlines/toomuch.txt");

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});
});
