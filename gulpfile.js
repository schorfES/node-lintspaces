var
	gulp 	= require('gulp'),
	mocha 	= require('gulp-mocha'),
	jshint 	= require('gulp-jshint'),
	jscs 	= require('gulp-jscs'),
	jshintOptions = {
		'boss': true,
		'curly': true,
		'eqeqeq': true,
		'eqnull': true,
		'expr': true,
		'globals': {
			'module': true,
			'require': true,
			'exports': true,
			'describe': true,
			'it': true,
			'__dirname': true,
			'__filename': true
		},
		'immed': true,
		'noarg': true,
		'onevar': true,
		'quotmark': 'single',
		'smarttabs': true,
		'trailing': true,
		'undef': true,
		'unused': true
	}
;

gulp.task('validate', function() {
	return gulp.src([__filename, './index.js', './lib/**/*.js', './test/**/test_*.js'])
		.pipe(jshint(jshintOptions))
		.pipe(jshint.reporter('default'))
		.pipe(jscs(__dirname + '/.jscs.json'));
});

gulp.task('test', function() {
	return gulp.src('./test/**/test_*.js')
		.pipe(mocha({
			resporter: 'spec',
			bail: true
		}));
});

gulp.task('default', ['validate', 'test']);
