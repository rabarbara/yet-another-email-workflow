const assert = require('assert')
const addParameters = require('../gulpfile').addParameters
const createParameterString = require('../gulpfile').createParameterString
const cheerioTest = require('cheerio')


describe('addParameters adds all utm parameters in an links object to all links if there are none present', function () {
  it('accepts a string, an object and a cheerio instance', function () {
    let basicString = 'string'
    let linksObject = {}
    assert.doesNotThrow(function () {
      addParameters(basicString, createParameterString(linksObject), cheerioTest)
    }, Error, 'File is empty')
  })
  it('returns the same element if the links object is empty', function () {
    let basicString = '<a href="https://www.google.com"'
    assert.equal(addParameters(basicString, createParameterString({}), cheerioTest), basicString)
    assert.equal(addParameters('', createParameterString({}), cheerioTest), '')
  })
  it('appends the parameters to the all links in the string', function () {
    let basicString = '<a href="https://www.google.com">Google</a> <a href="https://www.github.com">Github</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium'
      }
    }
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest), '<a href="https://www.google.com?utm_source=source&utm_medium=medium">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium">Github</a>')
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
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest), '<a href="https://www.google.com?utm_source=source&utm_medium=medium">Google</a> <a href="https://www.github.com?utm_source=source&utm_medium=medium">Github</a>')
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
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest),
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
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest),
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
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest),
      '<a href="https://www.google.com?utm_source=source&utm_medium=medium&utm_name=name&utm_term=term&utm_content=content">Google</a>')
  })

  it('if there are existing parameters it does not add anything', function () {
    let basicString = '<a href="https://www.google.com?utm_source=source">Google</a> <a href="https://www.google.com">Google</a>'
    let linksObject = {
      utm: {
        source: 'source',
        medium: 'medium',
        name: 'name',
        term: 'term',
        content: 'content'
      }
    }
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest),
      '<a href="https://www.google.com?utm_source=source">Google</a> <a href="https://www.google.com?utm_source=source&utm_medium=medium&utm_name=name&utm_term=term&utm_content=content">Google</a>')
  })
  it('if all utm parameters are empty, add nothing', function () {
    let basicString = '<a href="https://www.google.com?utm_source=source">Google</a> <a href="https://www.google.com">Google</a>'
    let linksObject = {
      utm: {
        source: '',
        medium: '',
        name: '',
        term: '',
        content: ''
      }
    }
    assert.equal(addParameters(basicString, createParameterString(linksObject), cheerioTest),
      '<a href="https://www.google.com?utm_source=source">Google</a> <a href="https://www.google.com">Google</a>')
  })
})

describe('the links object can also contain custom urls under the namespace "custom', function () {
  it('does not append anything if the custom namespace is empty', function () {
    let basicString = '<a href="https://www.google.com?utm_source=source">Google</a> <a href="https://www.google.com">Google</a>'
    let linksObject = {
      utm: {

      },
      custom: {
        myprefix: 'myprefix'
      }
    }
  })
})
