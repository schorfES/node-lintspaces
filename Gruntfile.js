var
	testableFiles = [
		'tests/**/*.js',
		'!tests/**/fixures/*.js',
	],
	docFiles = [
		'./docs/intro.md',
		'./docs/installation.md',
		'./docs/usage.md',
		'./docs/options.md',
		'./docs/functions.md',
		'./docs/contribution.md',
		'./docs/license.md'
	]
;


module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	// Node Unit:
	// -------------------------------------------------------------------------
	grunt.config('nodeunit', {
		all: testableFiles
	});
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Concat:
	// -------------------------------------------------------------------------
	grunt.config('concat', {
		all: {
			src: docFiles,
			dest: 'README.md'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');



	// Setup default tasks:
	// -------------------------------------------------------------------------
	grunt.registerTask('test', [
		'nodeunit'
	]);

	grunt.registerTask('docs', [
		'concat'
	]);

	grunt.registerTask('default', [
		'test',
		'docs'
	]);

};
