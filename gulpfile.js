const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const gutil = require('gulp-util')
const uncss = require('gulp-uncss')
const concat = require('gulp-concat')

gulp.task('serve', ['sass'], function () {
  browserSync.init({
    server: 'working'
  })
  gulp.watch('working/scss/*.scss', ['sass']).on('change', browserSync.reload)
  gulp.watch('working/*.html').on('change', browserSync.reload)
})

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', () => {
  return gulp.src('working/scss/*.scss')
      .pipe(plumber(function (error) {
        gutil.beep()
        console.log(error)
        this.emit('end')
      }))
      .pipe(sass())
      .pipe(gulp.dest('working/css'))
      .pipe(browserSync.stream())
})

// Compile sass into CSS, remove unneeded CSS and dump it into the working folder for use in build process
// it is not neccessary to create a build CSS file just for the purpose of building the final email
gulp.task('css', () => {
  return gulp.src('working/scss/*.scss')
    .pipe(plumber(function (error) {
      gutil.beep()
      console.log(error)
      this.emit('end')
    }))
    .pipe(sass())
    .pipe(uncss({
      html: ['working/index.html']
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('working/css'))
})
