var
	path 		= require('path'),
	should 		= require('should'),
	Validator	= require('../index')
;

describe('newlines', function() {
	var validator = new Validator({
		trailingspaces: true
	});

	it('fixtures/trailingspaces.txt should have errors', function() {
		var p = path.join(__dirname, 'fixtures/trailingspaces.txt');

		validator.validate(p);
		validator.getInvalidLines(p).should.not.be.empty;
	});
});
