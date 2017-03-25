const assert = require('assert')
const cheerioTest = require('cheerio')
const addParameters = require('../gulpfile').addParameters
const createParameterString = require('../gulpfile').createParameterString
const createHtml = require('../gulpfile').createHtml
const fs = require('fs')

describe('createHtml takes a html path to file and css path to file and creates the juiced html', function () {
  it('returns a html string', function () {
    const path = require('path')
    const file = fs.readFileSync('test/testAssets/index.html', 'utf-8')
    const cssPath = path.join('test/testAssets/styles.css')
    return createHtml(file, cssPath, addParameters, createParameterString, cheerioTest)
      .then(html => {
        assert.equal(html.includes('!DOCTYPE'), true)
        assert.equal(html.includes('<style>'), true)
        assert.equal(html.includes('style="'), true)
        assert.equal(html.includes('clas="'), false)
      })
  })
})
