const gulp = require('gulp');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');

gulp.task('copy-config', () => {
  return gulp.src('./src/**/*.json')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['copy-config'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('develop', ['build'], () => {
  return nodemon({
    script: 'dist/app.js',
    watch: 'src',
    tasks: ['build']
  });
});

gulp.task('default', ['build']);
