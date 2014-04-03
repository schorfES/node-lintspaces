var
	path 		= require('path'),
	should 		= require('should'),
	Validator	= require('../index')
;

describe('directory', function() {
	var validator = new Validator();

	it('should throw an exception if path is not a file.', function() {
		var p = path.join(__dirname, 'fixtures');

		validator.validate.bind(validator, p).should.throw();
	});
});
