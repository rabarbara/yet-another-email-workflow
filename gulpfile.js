const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const gutil = require('gulp-util')
const uncss = require('gulp-uncss')
const fs = require('fs')
const juice = require('juice')
const path = require('path')
const information = require(path.join(__dirname, 'working/information.json'))
const html2txt = require('gulp-html2txt')
const cheerio = require('cheerio')


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
const replaceLinks = (str, replacelist = {}) => {
  // there has to be a string to pass through even if replacelist is empty
  if (str.length < 1) throw new Error('File is empty')
  // if there is no replacelist or it is empty, pass through the value
  let html = str
  if (Object.keys(replacelist).length !== 0) {
    for (const key of Object.keys(replacelist)) {
      let replacestring = new RegExp(`#{${key}}`, 'g')
      html = html.replace(replacestring, replacelist[key])
    }
    let basicReg = /#{(.*?)}/g
    let els = html.match(basicReg)
    if (els !== null) {
      // find all matches and filter out the fluff
      // TODO think about if a set would be more appropriate as it would only list the unique values
      /*
      let allElements = new Set(els.map(x => x.replace('#{','').replace('}', '')))
      console.log(`Warning: there are still ${allElements.size} elements not replaced: ${[...allElements]}'`)
      */
      let allElements = els.map(x => x.replace('#{', '').replace('}', ''))
      console.log(`Warning: there are still ${allElements.length} instances not replaced: ${allElements}`)
    }
    return html
  } else {
    console.log('Warning: no links are provided, html goes through as is.')
    return str
  }
}

/**
* replaces each instance of a href atrribute in the first argument for the values provided in the second argument
* @param {string}
* @param {object}
* @return {string}
*/
const addParameters = (str, parameters, cheerio) => {
  // check if parameters exist, otherwise do not add them
  if (parameters.utm) {
    const $ = cheerio.load(str, {decodeEntities: false})
    let availableUtmKeys = ['source', 'medium', 'name', 'term', 'content']
    let paramsArr = []
    // loop through the object and add only the existing parameters
    for (const key of Object.keys(parameters.utm)) {
      // don't add if it is empty or if it is not a string or number
      if (parameters.utm[key] && (typeof parameters.utm[key] === 'string' || typeof parameters.utm[key] === 'number')) {
        // only add the keys that are valid utm keys, ignore the ones that are not correct
        // IGNORE OR ERROR?
        if (availableUtmKeys.indexOf(key) !== -1) {
          paramsArr.push(`utm_${key}=${parameters.utm[key]}`)
        }
      }
    }
    let paramsString = `?${paramsArr.join('&')}`
    $('a').each(function (i, el) {
      let origHref = $(this).attr('href')
      $(this).attr('href', origHref + paramsString)
    })
    return $.html()
  } else {
    // if there is nothing present return as is
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
      let email = replaceLinks(html, information.links)
      const removedCssLink = juice.inlineContent(email, css).replace('<link rel="stylesheet" href="../css/styles.css">', '')
      fs.writeFile('build/index.html', removedCssLink, (err) => {
        if (err) throw (err)
        done()
      })
    })
  })
})

// convert html to txt
gulp.task('txt', () => {
  return gulp.src('build/index.html')
  .pipe(html2txt())
  .pipe(gulp.dest('build/'))
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

gulp.task('build', gulp.series('css', 'premailer', 'txt'))
gulp.task('serve', gulp.series('sass', gulp.series('sass', 'browserSync', 'watchSassAndHtml')))

module.exports = {
  replaceLinks,
  addParameters
}
