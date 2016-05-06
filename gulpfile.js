var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var watch = require('gulp-watch');
var changed = require('gulp-changed');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');
var path = require('path');
var demon;


gulp.task("default", function() {
	return gulp.src("src/**/*.js")
		.pipe(babel())
		.pipe(gulp.dest("build")).on('end', function() {
			require('./build/index.js');
			setTimeout(function() {
				console.log('timeout');
				process.exit()
			}, 30000);
		});
});

gulp.task("sourcemaps", function() {
	return gulp.src("src/**/*.js")
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write("./maps"))
		.pipe(gulp.dest("build"));
});

gulp.task('serve', ['start-serve'], function() {
	gulp.watch(["src/**/*.js", "tests/**/*.js"], ['es6']);
});

gulp.task('upd', ['es6'], function() {
	return gulp.src(["build/**/*.js"])
		.pipe(gulp.dest("../iris-v2/node_modules/resource-management-framework/build"));
});

gulp.task('test-upd', ['start-test'], function() {
	gulp.watch(["src/**/*.js", "tests/**/*.js"], ['upd']);
});

gulp.task('test', ['start-test'], function() {
	gulp.watch(["src/**/*.js", "tests/**/*.js"], ['es6']);
});

gulp.task('es6', function() {
	return gulp.src(["src/**/*.js", "tests/**/*.js"])
		.pipe(changed("build"))
		.pipe(plumber({
			errorHandler: function(e) {
				console.log('error', e);
			}
		}))
		.pipe(babel())
		.pipe(gulp.dest("build"))
		.on('end', function() {
			console.log('build');
		});
})


gulp.task('start-test', function() {
	demon = nodemon({
		script: 'build/run.js',
		watch: ['build/'],
		execMap: {
			"js": "node  --harmony "
		},
		env: {
			'NODE_ENV': 'development'
		}
	});
});

gulp.task('start-serve', function() {
	demon = nodemon({
		script: 'build/run.js',
		watch: ['build/'],
		execMap: {
			"js": "node  --harmony "
		},
		env: {
			'NODE_ENV': 'development'
		}
	});
});