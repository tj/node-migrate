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
  it('should load store file', async function () {
    let store = new FileStore(MODERN_STORE_FILE)
    let result = await store.load()
    assert.equal(result.lastRun, '1480449051248-farnsworth.js')
    assert.equal(result.migrations.length, 2)
  })

  it('should convert pre-v1 store file format', async function () {
    let store = new FileStore(OLD_STORE_FILE)
    let result = await store.load()
    assert.equal(result.lastRun, '1480449051248-farnsworth.js')
    assert.equal(result.migrations.length, 2)

    result.migrations.forEach(function (migration) {
      assert.equal(typeof migration.title, 'string')
      assert.equal(typeof migration.timestamp, 'number')
    })
  })

  it('should error with invalid store file format', async function () {
    let store = new FileStore(BAD_STORE_FILE)
    let error
    try {
      await store.load()
      assert.equal(error, undefined)
    } catch (error) {
      assert.equal(error.message, 'Invalid store file')
    }
  })

  it('should error with invalid pos', async function () {
    let store = new FileStore(INVALID_STORE_FILE)
    let error
    try {
      await store.load()
      assert.equal(error, undefined)
    } catch (error) {
      assert.equal(error.message, 'Store file contains invalid pos property')
    }
  })
})
