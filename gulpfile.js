var
	util         = require('util'),
	gulp         = require('gulp'),
	jshint       = require('gulp-jshint'),
	jscs         = require('gulp-jscs'),
	map          = require('gulp-jshint/node_modules/map-stream'),
	jshintErrors = []
;;;

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
				'%s\nLine: %d\nMessage: %s\n\n',
				error.file,
				error.error.line,
				error.error.reason
			);
		}).join(''));
		process.exit(1);
	}
});
