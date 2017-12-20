/* global describe, it */

const path = require('path')
const assert = require('assert')

const FileStore = require('../lib/file-store.js')

const BASE = path.join(__dirname, 'fixtures', 'file-store')
const MODERN_STORE_FILE = path.join(BASE, 'good-store')
const OLD_STORE_FILE = path.join(BASE, 'old-store')
const BAD_STORE_FILE = path.join(BASE, 'bad-store')

describe('FileStore tests', () => {
  it('should load store file', (done) => {
    let store = new FileStore(MODERN_STORE_FILE)
    store.load((err, store) => {
      if (err) {
        return done(err)
      }

      assert.equal(store.lastRun, '1480449051248-farnsworth.js')
      assert.equal(store.migrations.length, 2)

      return done()
    })
  })

  it('should convert pre-v1 store file format', (done) => {
    let store = new FileStore(OLD_STORE_FILE)
    store.load((err, store) => {
      if (err) {
        return done(err)
      }

      assert.equal(store.lastRun, '1480449051248-farnsworth.js')
      assert.equal(store.migrations.length, 2)

      return done()
    })
  })

  it('should error with invalid store file format', (done) => {
    let store = new FileStore(BAD_STORE_FILE)
    store.load((err, store) => {
      if (!err) {
        return done(new Error('Error expected'))
      }

      assert.equal(err.message, 'Invalid store file')

      return done()
    })
  })
})
