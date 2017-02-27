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

/**
* replaces each instance of a replacelist key template in the string for the replacelist value
* @param {string}
* @param {object}
* @return {string}
*/
const replaceLinks = (str, replacelist) => {
  // there has to be a string to pass through even if replacelist is empty
  if (str.length < 1) throw new Error('File is empty')
  // if there is no replacelist or it is empty, pass through the value
  let html = str
  if (Object.keys(replacelist).length !== 0) {
    for (const key of Object.keys(replacelist)) {
      let replacestring = new RegExp(`#{${key}}`, 'g')
      html = html.replace(replacestring, replacelist[key])
    }
    return html
  } else {
    console.log('Warning: no links are provided, html goes through as is.')
    return str
  }
}

gulp.task('premailer', (done) => {
  // read the html file
  return fs.readFile('working/index.html', 'utf-8', (err, html) => {
    if (err) throw (err)
    // read the css file
    fs.readFile('working/css/styles.css', 'utf-8', (err, css) => {
      if (err) throw (err)
      // pass both the html and css string into juice. This is done because of path issues in the html
      //  => juice does not find the css because of the relative path import in the html file
      // we also need to remove the link to css to not cause issues in email clients
      let html = replaceLinks(html)
      const removedCssLink = juice.inlineContent(html, css).replace('<link rel="stylesheet" href="../css/styles.css">', '')
      fs.writeFile('build/index.html', removedCssLink, (err) => {
        if (err) throw (err)
        done()
      })
    })
  })
})

// start up browserSync
gulp.task('browserSync', () => {
  browserSync.init({
    server: 'working'
  })
})

// reload browserSync
gulp.task('reload', () => {
  browserSync.reload()
})

// watch scss and html files for changes
gulp.task('watchSassAndHtml', () => {
  gulp.watch('working/scss/*.scss', gulp.series('sass', 'reload'))
  gulp.watch('working/scss/*.scss', gulp.series('reload'))
})

gulp.task('build', gulp.series('css', 'premailer'))
gulp.task('serve', gulp.series('sass', gulp.series('sass', 'browserSync', 'watchSassAndHtml')))

module.exports = {
  replaceLinks
}
