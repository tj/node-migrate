/* eslint-env mocha */
'use strict'
const { rimraf } = require('rimraf')
const path = require('path')
const assert = require('assert')
const migrate = require('../')

const BASE = path.join(__dirname, 'fixtures', 'promises')
const STATE = path.join(__dirname, 'fixtures', '.migrate')

describe('Promise migrations', function () {
  let set

  beforeEach(function (done) {
    migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
    }, function (err, s) {
      set = s
      done(err)
    })
  })

  afterEach(function () {
    return rimraf(STATE)
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
    let warned = false
    set.on('warning', function (msg) {
      assert(msg)
      warned = true
    })
    set.up('3-callback-promise-test.js', function () {
      assert(warned)
      done()
    })
  })

  it('should warn with no promise or callback', function (done) {
    set.up('3-callback-promise-test.js', function () {
      let warned = false
      set.on('warning', function (msg) {
        assert(msg)
        warned = true
      })
      set.up('4-neither-test.js', function () {
        assert(warned)
        done()
      })
    })
  })

  it("shouldn't error with resolved promises", function (done) {
    set.up('5-resolve-test.js', function (err) {
      assert(!err)
      done()
    })
  })

  it('should error with rejected promises', function (done) {
    set.up('99-failure-test.js', function (err) {
      assert(err)
      assert.strictEqual(err.message, 'foo')
      done()
    })
  })
})
