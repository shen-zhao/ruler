var gulp = require('gulp');
var uglyfly = require('gulp-uglyfly');
var minify = require('gulp-minify');
var rename = require("gulp-rename");


gulp.task('default', function() {
    gulp.src('src/*.js')
        // .pipe(uglyfly())
        .pipe(minify())
        .pipe(gulp.dest('dist'))
});