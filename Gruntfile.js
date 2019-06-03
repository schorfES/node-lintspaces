var
	docFiles = [
		'./docs/intro.md',
		'./docs/installation.md',
		'./docs/usage.md',
		'./docs/options.md',
		'./docs/functions.md',
		'./docs/contribution.md',
		'./docs/license.md',
	]
;


module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	// Concat:
	// -------------------------------------------------------------------------
	grunt.config('concat', {
		all: {
			src: docFiles,
			dest: 'README.md',
		},
	});

	grunt.loadNpmTasks('grunt-contrib-concat');



	// Setup default tasks:
	// -------------------------------------------------------------------------
	grunt.registerTask('docs', [
		'concat',
	]);

	grunt.registerTask('default', [
		'docs',
	]);

};
