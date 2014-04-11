var Validator = require('../index');

require('should');

describe('wrong files', function() {
	var validator = new Validator();

	it('should throw the exception "{a} does not exists" if path does not exists', function() {
		var p = '/this/file/does/not/exists';
		validator.validate.bind(validator, p).should.throw(/does not exists/);
	});

	it('should throw the exception "{a} is not a file" if path is a directory', function() {
		var p = __dirname;
		validator.validate.bind(validator, p).should.throw(/is not a file/);
	});

	it('should throw the exception "config file wasn\'t found" if editorconfig does not exists', function() {
		var
			p = '/this/file/does/not/exists',
			validator = new Validator({
				editorconfig: p
			})
		;

		validator._path = p;
		validator._loadSettings.bind(validator).should.throw(/config file .+? wasn't found/);
	});

	it('should throw the exception "{a} is not a file" if editorconfig is a directory', function() {
		var
			p = __dirname,
			validator = new Validator({
				editorconfig: p
			})
		;

		validator._path = p;
		validator._loadSettings.bind(validator).should.throw(/is not a file/);
	});
});
