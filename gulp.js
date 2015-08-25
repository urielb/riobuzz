/**
 * Created by urielbertoche on 8/23/2015.
 */

// grab our packages
var gulp = require('gulp');
var jshint = require('gulp-jshint');

// define the default task and add watcher to it
gulp.task('default', ['watch', 'browser-sync']);

// configure the jshint task
gulp.task('jshint', function () {
  return gulp.src('source/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reported('jshint-stylish'));
});

// build js
gulp.task('build-js', function () {
  return gulp.src('source/media/javascript/**/*.js')
      .pipe(concat('bundle.js'))
      // only uglify if gulp is ran with --type production
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
      .pipe(gulp.dest('public/assets/javascript'));
});

// build css
gulp.task('build-css', function () {
  return gulp.src('source/media/stylesheet/**/*.css')
      .pipe(concat('bundle.css'))
    // only uglify if gulp is ran with --type production
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
      .pipe(gulp.dest('public/assets/css'));
});

// browser sync task
var browserSync = require('browser-sync');
gulp.task('browser-sync', function () {
  var files = [
      'source/**/*.jade',
      'public/assets/css/**/*.css',
      'public/assets/imgs/**/*',
      'public/assets/js/**/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: './public'
    }
  });
});

// configure which files to watch and what tasks to execute on file change
gulp.task('watch', function() {
  gulp.watch('source/**/*.js', ['jshint']);
  gulp.watch('source/media/javascript/**/*.js', ['build-js']);
  gulp.watch('source/media/stylesheet/**/*.js', ['build-css']);
});