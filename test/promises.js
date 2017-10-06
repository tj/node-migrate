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

  it('should warn when using promise but still calling callback', function (done) {
    var warned = false
    set.on('warning', function (msg) {
      assert(msg)
      warned = true
    })
    set.up('3-callback-promise-test.js', function () {
      assert(warned)
      done()
    })
  })

  it('should error with rejected promises', function (done) {
    set.up('4-failure-test.js', function (err) {
      assert(err)
      assert.equal(err.message, 'foo')
      done()
    })
  })
})
