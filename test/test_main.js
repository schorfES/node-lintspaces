var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('main', function() {
	var validator = new Validator({
		newline: true,
		indentation: 'tabs',
		trailingspaces: true,
		ignores: [
			'js-comments'
		]
	});

	it('the validator should be valid ;-)', function() {
		var p = path.join(__dirname, '../lib/validator.js');

		validator.validate(p);
		validator.getInvalidLines(p).should.be.empty;
	});

	it('the validator should return the expected format', function() {
		var
			p1 = path.join(__dirname, 'fixtures/trailingspaces.txt'),
			p2 = path.join(__dirname, 'fixtures/comments/javascript.js'),
			invalidFiles
		;

		validator.validate(p1);
		validator.validate(p2);
		invalidFiles = validator.getInvalidFiles();

		invalidFiles.should.be.instanceOf(Object);
		Object.keys(invalidFiles).length.should.not.be.equal(0);

		invalidFiles[p1].should.be.instanceOf(Object);
		invalidFiles[p2].should.be.instanceOf(Object);

		Object.keys(invalidFiles[p1]).should.be.eql(
			['3', '4', '5', '6', '7', '8', '9', '10']
		);
		invalidFiles[p1]['3'].should.be.instanceOf(Array);
		invalidFiles[p1]['3'].should.not.be.instanceOf(String);
	});
});
