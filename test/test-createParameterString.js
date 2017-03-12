const assert = require('assert')
const createParameterString = require('../gulpfile').createParameterString

describe('createParameterString takes a links object and returns a complete url parameter string', function () {
  it('returns empty string if the links object is empty', function () {
    let linksObject = {}
    assert.equal(createParameterString(linksObject), '')
  })
})
