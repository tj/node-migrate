/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const FileStore = require('../lib/file-store')

const BASE = path.join(__dirname, 'fixtures', 'file-store')
const MODERN_STORE_FILE = path.join(BASE, 'good-store')
const OLD_STORE_FILE = path.join(BASE, 'old-store')
const BAD_STORE_FILE = path.join(BASE, 'bad-store')
const INVALID_STORE_FILE = path.join(BASE, 'invalid-store')

describe('FileStore tests', function () {
  it('should load store file', function (done) {
    let store = new FileStore(MODERN_STORE_FILE)
    store.load(function (err, store) {
      if (err) {
        return done(err)
      }

      assert.strictEqual(store.lastRun, '1480449051248-farnsworth.js')
      assert.strictEqual(store.migrations.length, 2)

      return done()
    })
  })

  it('should convert pre-v1 store file format', function (done) {
    let store = new FileStore(OLD_STORE_FILE)
    store.load(function (err, store) {
      if (err) {
        return done(err)
      }

      assert.strictEqual(store.lastRun, '1480449051248-farnsworth.js')
      assert.strictEqual(store.migrations.length, 2)

      store.migrations.forEach(function (migration) {
        assert.strictEqual(typeof migration.title, 'string')
        assert.strictEqual(typeof migration.timestamp, 'number')
      })

      return done()
    })
  })

  it('should error with invalid store file format', function (done) {
    let store = new FileStore(BAD_STORE_FILE)
    store.load(function (err, store) {
      if (!err) {
        return done(new Error('Error expected'))
      }

      assert.strictEqual(err.message, 'Invalid store file')

      return done()
    })
  })

  it('should error with invalid pos', function (done) {
    let store = new FileStore(INVALID_STORE_FILE)
    store.load(function (err, store) {
      if (!err) {
        return done(new Error('Error expected'))
      }

      assert.strictEqual(err.message, 'Store file contains invalid pos property')

      return done()
    })
  })
})
