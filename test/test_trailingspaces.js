var
	path = require('path'),
	Validator = require('../index')
;

require('should');

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
