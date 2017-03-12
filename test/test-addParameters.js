const assert = require('assert')
const addParameters = require('../gulpfile').addParameters
const cheerio = require('cheerio')


describe('addParameters adds all parameters in information.json to all links if there are none present', function () {
  it('accepts a string and an object and a cheerio instance', function () {
    let basicString = 'string'
    let linksObject = {}
    assert.doesNotThrow(function () {
      addParameters(basicString, linksObject, cheerio)
    }, Error, 'File is empty')
  })
  it('returns the same element if the links object is empty', function () {
    let basicString = '<a href="https://www.google.com"'
    assert.equal(addParameters(basicString, {}, cheerio), basicString)
    assert.equal(addParameters('', {}, cheerio), '')
  })
  it('appends the parameters to the all links in the string', function () {
    let basicString = '<a href="https://www.google.com">Google</a> <a href="https://www.github.com">Github</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium'
      }
    }
    assert.equal(addParameters(basicString, linksObject, cheerio), '<a href="https://www.google.com?utm_source=source&utm_medium=medium">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium">Github</a>')
  })
  it('appends only the elements that are not empty', function () {
    let basicString = '<a href="https://www.google.com">Google</a> <a href="https://www.github.com">Github</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium',
        name: ''
      }
    }
    assert.equal(addParameters(basicString, linksObject, cheerio), '<a href="https://www.google.com?utm_source=source&utm_medium=medium">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium">Github</a>')
  })
  it('appends only strings or numbers, ignores other types of key values', function () {
    let basicString = '<a href="https://www.google.com">Google</a> <a href="https://www.github.com">Github</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium',
        name: 5,
        content: function () {
          console.log('Faulty function')
        }
      }
    }
    assert.equal(addParameters(basicString, linksObject, cheerio),
      '<a href="https://www.google.com?utm_source=source&utm_medium=medium&utm_name=5">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium&utm_name=5">Github</a>')
  })
  it('adds only the valid utm keys, rejects the ones that do not match', function () {
    let basicString = '<a href="https://www.google.com">Google</a> <a href="https://www.github.com">Github</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium',
        name: 5,
        content: function () {
          console.log('Faulty function')
        },
        fake: 'fake'
      }
    }
    assert.equal(addParameters(basicString, linksObject, cheerio),
      '<a href="https://www.google.com?utm_source=source&utm_medium=medium&utm_name=5">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium&utm_name=5">Github</a>')
  })
  it('adds only the valid utm keys, rejects the ones that do not match', function () {
    let basicString = '<a href="https://www.google.com">Google</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium',
        name: 'name',
        term: 'term',
        content: 'content'
      }
    }
    assert.equal(addParameters(basicString, linksObject, cheerio),
      '<a href="https://www.google.com?utm_source=source&utm_medium=medium&utm_name=name&utm_term=term&utm_content=content">Google</a>')
  })
})
