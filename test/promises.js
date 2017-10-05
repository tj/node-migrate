/* global describe, it, beforeEach, afterEach */

var rimraf = require('rimraf')
var path = require('path')
var assert = require('assert')

var migrate = require('../')

var BASE = path.join(__dirname, 'fixtures', 'promises')
var STATE = path.join(__dirname, 'fixtures', '.migrate')

describe('Promise migrations', function () {
  var set

  beforeEach(function (done) {
    migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
    }, function (err, s) {
      set = s
      done(err)
    })
  })

  afterEach(function (done) {
    rimraf(STATE, done)
  })

  it('should handle callback migration', function (done) {
    set.up('1-callback-test.js', function (err) {
      assert.ifError(err)
      done()
    })
  })

  it('should handle promise migration', function (done) {
    set.up('2-promise-test.js', function (err) {
      assert.ifError(err)
      done()
    })
  })

  it('should error when using promise + callback', function (done) {
    let errorThrown = false
    set.up('3-failure-test.js', function (err) {
      if (errorThrown) {
        return
      }

      assert(err)
      assert.equal(err.message, 'Migration was already run. Please provide callback OR promise, not both.')
      errorThrown = true
      done()
    })
  })
})
