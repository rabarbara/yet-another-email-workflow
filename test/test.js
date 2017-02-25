const assert = require('assert')
const sinon = require('sinon')
const g = require('../gulpfile')
describe('replaceLinks takes a string and an object and replaces all instances of a special substring', function () {
  it('replace template expression with a link', function () {
    let basicString = '<a href="#{link1}">'
    let linksObject = {'link1': 'https://www.google.com'}
    assert.equal(g.replaceLinks(basicString, linksObject), '<a href="https://www.google.com">')
  })
  it('throws an error if an empty string is passed into it', function () {
    let basicString = ''
    let linksObject = {'link1': 'https://www.google.com'}
    assert.throws(function () {
      g.replaceLinks(basicString, linksObject)
    }, Error, 'File is empty')
  })
  it('returns the same string if the linksObject has no links', function () {
    let basicString = '<a href="#{link1}">'
    let linksObject = {}
    assert.equal(g.replaceLinks(basicString, linksObject), '<a href="#{link1}">')
  })
})
