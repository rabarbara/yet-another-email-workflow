const assert = require('assert')
const sinon = require('sinon')
const replaceLinks = require('../gulpfile').replaceLinks

describe('replaceLinks takes a string and an object and replaces all instances of a special substring', function () {
  it('replace template expression with a link', function () {
    let basicString = '<a href="#{link1}">'
    let linksObject = {'link1': 'https://www.google.com'}
    assert.equal(replaceLinks(basicString, linksObject), '<a href="https://www.google.com">')
  })
  it('throws an error if an empty string is passed into it', function () {
    let basicString = ''
    let linksObject = {'link1': 'https://www.google.com'}
    assert.throws(function () {
      replaceLinks(basicString, linksObject)
    }, Error, 'File is empty')
  })
  it('returns the same string if the linksObject has no links', function () {
    let basicString = '<a href="#{link1}">'
    let linksObject = {}
    assert.equal(replaceLinks(basicString, linksObject), '<a href="#{link1}">')
  })
  it('warns that the linksObject has no links and the html was unchanged', function () {
    let basicString = '<a href="#{link1}">'
    let linksObject = {}

    let spy = sinon.spy(console, 'log')
    replaceLinks(basicString, linksObject)
    assert(spy.calledWith('Warning: no links are provided, html goes through as is.'))

    spy.restore()
    spy.reset()
  })
  describe('replaceLinks replaces all instances of a string in a template', function () {
    it('replaces all instances if there are more than one', function () {
      let basicString = '<a href="#{link1}"></a><a href="#{link1}"></a><a href="#{link1}"></a>'
      let linksObject = {'link1': 'https://www.google.com'}
      assert.equal(replaceLinks(basicString, linksObject), '<a href="https://www.google.com"></a><a href="https://www.google.com"></a><a href="https://www.google.com"></a>')
    })
    it('replaces all instances if there are more than one and if they are different', function () {
      let basicString = '<a href="#{link1}"></a><a href="#{link2}"></a><a href="#{link1}"></a>'
      let linksObject = {'link1': 'https://www.google.com', 'link2': 'https://www.github.com'}
      assert.equal(replaceLinks(basicString, linksObject), '<a href="https://www.google.com"></a><a href="https://www.github.com"></a><a href="https://www.google.com"></a>')
    })
    it('replaces only the elements that are provided in the string', function () {
      let basicString = '<a href="#{link1}"></a><a href="#{link2}"></a><a href="#{link1}"></a>'
      let linksObject = {'link1': 'https://www.google.com', 'link2': 'https://www.github.com', 'link3': 'https://www.mdn.com'}
      assert.equal(replaceLinks(basicString, linksObject), '<a href="https://www.google.com"></a><a href="https://www.github.com"></a><a href="https://www.google.com"></a>')
    })
  
  })
})
