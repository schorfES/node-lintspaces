var
	path = require('path'),
	Validator = require('../index')
;

require('should');

describe('editorconfig', function() {
	it('should override the settings', function() {
		var
			p = path.join(__dirname, '..', '.editorconfig'),
			validator = new Validator({
				newline: false,
				indentation: false,
				spaces: 2,
				trailingspaces: false,
				editorconfig: p
			})
		;

		validator._path = p;
		validator._loadSettings();
		validator._settings.newline.should.be.equal(true);
		validator._settings.indentation.should.be.equal('tabs');
		validator._settings.spaces.should.be.equal(4);
		validator._settings.trailingspaces.should.be.equal(true);
	});
});
