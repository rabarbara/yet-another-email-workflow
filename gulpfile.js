const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const gutil = require('gulp-util')
const fs = require('fs')
const juice = require('juice')
const path = require('path')
const information = require(path.join(__dirname, 'working/information.json'))
const html2txt = require('gulp-html2txt')
const cheerio = require('cheerio')
const mailgun = require('mailgun.js')
const imagemin = require('gulp-imagemin')
const postcss = require('gulp-postcss')
const uncss = require('postcss-uncss')

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', (done) => {
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
  var plugins = [
    uncss({
      html: ['working/index.html']
    })
  ]
  return gulp.src('working/scss/*.scss')
    .pipe(plumber(function (error) {
      gutil.beep()
      console.log(error)
      this.emit('end')
    }))
    .pipe(sass())
    .pipe(postcss(plugins))
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
* creates a url parameter string from the links object given
* @param {object}
* @return {string}
*/
const createParameterString = (parameters) => {
  let availableUtmKeys = ['source', 'medium', 'name', 'term', 'content']
  let paramsArr = []

  // check if the parameters exist, otherwise don't bother
  if (parameters.utm || parameters.custom) {
    // loop through all the utm and custom keys
    for (const paramKeys of Object.keys(parameters)) {
      // loop through the inner keys of utm and custom
      for (const key of Object.keys(parameters[paramKeys])) {
        // don't add if it is empty or if it is not a string or number
        if (parameters[paramKeys][key] && (typeof parameters[paramKeys][key] === 'string' || typeof parameters[paramKeys][key] === 'number')) {
          // only add the keys that are valid utm keys, ignore the ones that are not correct
          // IGNORE OR ERROR?
          if (paramKeys === 'utm' && availableUtmKeys.indexOf(key) !== -1) {
            paramsArr.push(`utm_${key}=${parameters[paramKeys][key]}`)
          } else if (paramKeys !== 'utm') { // if the keys are not utm, you are free to add them
            paramsArr.push(`${key}=${parameters[paramKeys][key]}`)
          }
        }
      }
    }
  }
  // joining all parameters in a string
  // if there are no parameters, create an empty string
  let paramsString = paramsArr.length !== 0 ? `?${paramsArr.join('&')}` : ''
  return paramsString
}

/**
* replaces each instance of a href atrribute in the first argument for the values provided in the second argument
* @param {string}
* @param {string}
* @param {function}
* @return {string}
*/
const addParameters = (str, parameters = '', cheerio) => {
  // check if the createParameterString returns a non-empty string
  // to avoid all the work that is not needed
  if (parameters) {
    // load the cheerio instance for appending links
    const $ = cheerio.load(str, { decodeEntities: false })
    // create the parameter string that will be appended to each href

    // add the parameters to each href in the email
    $('a').each(function (i, el) {
      let origHref = $(this).attr('href')
      // if the split method returns an array that is longer than 1 element, it means that there is an existing parameter in it
      // append the parameters only if there is no existing parameters
      if (origHref.split('?').length === 1) {
        $(this).attr('href', origHref + parameters)
      }
    })
    return $.html()
  } else {
    // if there is nothing available, return as is
    return str
  }
}

/**
* replaces each instance of a href atrribute in the first argument for the values provided in the second argument
* @param {string}
* @param {string}
* @return {string}
*/
const createHtml = (html, cssPath, addParameters, createParameterString, cheerio) => {
  return new Promise((resolve, reject) => {
    // replace the file path in the html file so that juice can find it, looking from the root of the project
    // replace the path for images since juice needs all files to be present
    let email = html.replace('<link rel="stylesheet" href="css/styles.css">', `<link rel="stylesheet" href="${cssPath}">`).replace('img/', 'working/img/')
    juice.juiceResources(email, { preserveMediaQueries: true, applyStyleTags: true }, (err, html) => {
      if (err) reject(err)
      // replace the url placeholder and add url parameters
      resolve(addParameters(replaceLinks(html, information.links), createParameterString(information.parameters), cheerio))
    })
  })
}

gulp.task('premailer', (done) => {
  fs.readFile('working/index.html', 'utf-8', (err, html) => {
    if (err) throw err
    createHtml(html, 'working/css/styles.css', addParameters, createParameterString, cheerio).then(html => {
      fs.writeFile('build/index.html', html.replace('working/img/', 'img/'), 'utf8', err => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.mkdir('build', err => {
              if (err) console.log(err)
              fs.writeFile('build/index.html', html.replace('working/img/', 'img/'), 'utf8', err => {
                if (err) console.log(err)
                done()
              })
            })
          }
        } else {
          done()
        }
      })
    }).catch(e => {
      console.log(e)
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
gulp.task('browserSync', (done) => {
  browserSync.init({
    server: 'working'
  })
  done()
})

// reload browserSync
gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

// watch scss and html files for changes
gulp.task('watchSassAndHtml', () => {
  gulp.watch('working/scss/*.scss', gulp.parallel('sass', 'reload'))
  gulp.watch('working/*.html', gulp.series('reload'))
})

// compress images
gulp.task('img', (done) => {
  return gulp.src('working/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'))
})

const sendmail = (done) => {
  const credentials = require('./credentials.json')
  const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || credentials.mailgun.key })
  const information = require('./working/information.json')
  const html = new Promise((resolve, reject) => {
    fs.readFile('./build/index.html', 'utf-8', (err, data) => {
      if (err) throw Error(err)
      if (data.length > 0) {
        let newData = data.replace(/img\/(.*?)"/gi, 'cid:$1"')
        resolve(newData)
      } else {
        reject('Empty file')
      }
    })
  })
  const text = new Promise((resolve, reject) => {
    fs.readFile('./build/index.txt', 'utf-8', (err, data) => {
      if (err) throw Error(err)
      if (data.length > 0) {
        resolve(data)
      } else {
        reject('Empty file')
      }
    })
  })
  const images = new Promise((resolve, reject) => {
    // read the path to the images and return a readStream for each file
    fs.readdir(path.join(__dirname, 'working', 'img'), (err, files) => {
      console.log(files)
      if (err) reject(err)
      const streamOfImages = files.map(img => {
        return fs.createReadStream(path.join(__dirname, 'working', 'img', img))
      })
      resolve(streamOfImages)
    })
  })
  const attachments = new Promise((resolve, reject) => {
    // read the path to the attachments and return a readStream for each file
    fs.readdir(path.join(__dirname, 'working', 'attachments'), (err, files) => {
      if (err) throw Error(err)
      const streamOfFiles = files
      .filter(file => {
        // .gitkeep should not be sent
        return file !== '.gitkeep'
      })
      .map(file => {
        return fs.createReadStream(path.join(__dirname, 'working', 'attachments', file))
      })
      resolve(streamOfFiles)
    })
  })
  Promise.all([html, text, images, attachments]).then(emails => {
    let [html, text, images, attachments] = emails
    mg.messages.create(credentials.mailgun.domain, {
      from: `${information.senderName} ${information.senderEmail}`,
      to: information.recipient,
      subject: information.subject,
      text: html,
      html: text,
      inline: images,
      attachment: attachments
    })
      .then(msg => {
        console.log(msg)
        done()
      }
      ) // logs response data
      .catch(err => {
        console.log(err)
        done()
      }) // logs any error
    done()
  }).catch(err => {
    console.log(err)
    done()
  })
}

gulp.task('email', gulp.series('css', 'premailer', 'txt', sendmail))
gulp.task('build', gulp.series('css', 'premailer', 'txt', 'img'))
gulp.task('serve', gulp.series('sass', gulp.parallel('browserSync', 'watchSassAndHtml')))

module.exports = {
  replaceLinks,
  addParameters,
  createParameterString,
  createHtml,
  sendmail
}
