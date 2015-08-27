/**
 * Created by urielbertoche on 8/23/2015.
 */

// grab our packages
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');

// define the default task and add watcher to it
gulp.task('default', ['build-js', 'build-css', 'watch', 'browser-sync']);

// configure the jshint task
gulp.task('jshint', function () {
  return gulp.src('app/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'));
});

// build js
gulp.task('build-js', function () {
  return gulp.src('app/media/javascript/**/*.js')
      .pipe(concat('bundle.js'))
      // only uglify if gulp is ran with --type production
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
      .pipe(gulp.dest('public/js'));
});

// build css
gulp.task('build-css', function () {
  return gulp.src('app/media/stylesheet/**/*.css')
      .pipe(concat('bundle.css'))
    // only uglify if gulp is ran with --type production
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
      .pipe(gulp.dest('public/css'));
});

// browser sync task
var browserSync = require('browser-sync');
gulp.task('browser-sync', ['nodemon'], function () {
  var files = [
      'app/**/*.jade',
      'public/css/**/*.css',
      'public/imgs/**/*',
      'public/js/**/*.js'
  ];

  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync.init({

    // watch the following files; changes will be injected (css & images) or cause browser to refresh
    files: files,

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    // open the proxied app in chrome
    browser: ['google-chrome']
  });
});

var BROWSER_SYNC_RELOAD_DELAY = 500;
//run app using nodemon
gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({

    // nodemon our expressjs server
    script: 'app/app.js',

    // watch core server file(s) that require server restart on change
    watch: ['app/app.js']
  })
      .on('start', function onStart() {
        // ensure start only got called once
        if (!called) { cb(); }
        called = true;
      })
      .on('restart', function onRestart() {
        // reload connected browsers after a slight delay
        setTimeout(function reload() {
          browserSync.reload({
            stream: false   //
          });
        }, BROWSER_SYNC_RELOAD_DELAY);
      });
});

// configure which files to watch and what tasks to execute on file change
gulp.task('watch', function() {
  gulp.watch('app/**/*.js', ['jshint']);
  gulp.watch('app/media/javascript/**/*.js', ['build-js']);
  gulp.watch('app/media/stylesheet/**/*.css', ['build-css']);
});