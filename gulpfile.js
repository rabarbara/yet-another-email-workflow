const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const gutil = require('gulp-util')
const uncss = require('gulp-uncss')
const fs = require('fs')
const juice = require('juice')

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', () => {
  return gulp.src('working/scss/*.scss')
      // plumber is used so that the watch task does not break when there is some wrong code
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
    .pipe(gulp.dest('working/css'))
})

gulp.task('premailer', (done) => {
  // read the html file
  return fs.readFile('working/index.html', 'utf-8', (err, html) => {
    if (err) throw (err)
    // read the css file
    fs.readFile('working/css/styles.css', 'utf-8', (err, css) => {
      if (err) throw (err)
      // pass both the html and css string into juice. This is done because of path issues in the html
      //  => juice does not find the css because of the relative path import in the html file
      fs.writeFile('build/index.html', juice.inlineContent(html, css), (err) => {
        if (err) throw (err)
        done()
      })
    })
  })
})

gulp.task('serve', gulp.series('sass', function () {
  browserSync.init({
    server: 'working'
  })
  gulp.watch('working/scss/*.scss', ['sass']).on('change', browserSync.reload)
  gulp.watch('working/*.html').on('change', browserSync.reload)
}))

gulp.task('build', gulp.series('css', 'premailer'))
