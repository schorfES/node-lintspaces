var
	util         = require('util'),
	gulp         = require('gulp'),
	colors       = require('gulp/node_modules/gulp-util').colors,
	jshint       = require('gulp-jshint'),
	jscs         = require('gulp-jscs'),
	map          = require('gulp-jshint/node_modules/map-stream'),
	jshintErrors = []
;

gulp.task('lint', function() {
	return gulp.src([__filename, './index.js', './lib/**/*.js', './test/**/test_*.js'])
		.pipe(jshint())
		.pipe(map(function (file, cb) {
			if (file.jshint && !file.jshint.success) {
				jshintErrors.push.apply(jshintErrors, file.jshint.results);
			}

			cb(null, file);
		}))
		.pipe(jscs(__dirname + '/.jscs.json'));
});

gulp.task('default', ['lint'], function() {
	if (jshintErrors.length) {
		console.error(jshintErrors.map(function(error) {
			return util.format(
				'[%s] %s in (%s:%d)\n',
				colors.green('gulp-jshint'),
				colors.red(error.error.reason),
				error.file,
				error.error.line
			);
		}).join(''));
		process.exit(1);
	}
});
