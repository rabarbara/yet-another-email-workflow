const assert = require('assert')
const createParameterString = require('../gulpfile').createParameterString

describe('createParameterString takes a links object and returns a complete url parameter string', function () {
  it(': returns empty string if the links object is empty', function () {
    let linksObject = {}
    assert.equal(createParameterString(linksObject), '')
  })
  it(': returns a correct parameters string', function () {
    let linksObject = {
      utm: {
        source: 'sourceTest'
      }
    }
    assert.equal(createParameterString(linksObject), '?utm_source=sourceTest')

    linksObject = {
      utm: {
        source: 'sourceTest',
        name: 'nameTest'
      }
    }
    assert.equal(createParameterString(linksObject), '?utm_source=sourceTest&utm_name=nameTest')

    linksObject = {
      utm: {
        source: 'sourceTest',
        name: 'nameTest',
        content: function () {
          return undefined
        }
      }
    }
    assert.equal(createParameterString(linksObject), '?utm_source=sourceTest&utm_name=nameTest')

    linksObject = {
      utm: {
        source: 'sourceTest',
        name: 'nameTest',
        content: 'testContent'
      }
    }
    assert.equal(createParameterString(linksObject), '?utm_source=sourceTest&utm_name=nameTest&utm_content=testContent')

    linksObject = {
      utm: {
        source: 'sourceTest',
        name: 'nameTest'
      },
      custom: {
        customTest: 'testCustom'
      }
    }
    assert.equal(createParameterString(linksObject), '?utm_source=sourceTest&utm_name=nameTest&customTest=testCustom')
  })
})
