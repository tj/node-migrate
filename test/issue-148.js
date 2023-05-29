/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const { mkdirp } = require('mkdirp')
const fs = require('fs')
const { create, up, down, init } = require('./util/run')

const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')

describe('issue #148 - `migrate create --migrations-dir=... foo` should allow an absolute path', () => {
  function reset () {
    rimraf.sync(TMP_DIR)
    return mkdirp(TMP_DIR)
  }

  beforeEach(reset)
  afterEach(reset)

  it('should allow an absolute path', (done) => {
    init(TMP_DIR, ['--migrations-dir', path.join(TMP_DIR, 'other')], (err, out, code) => {
      assert.ifError(err)
      assert.strictEqual(code, 0, out)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'other'))
      })

      create(TMP_DIR, ['--migrations-dir', path.join(TMP_DIR, 'other'), 'foo'], (err, out, code) => {
        assert.ifError(err)
        assert.strictEqual(code, 0, out)

        up(TMP_DIR, ['--migrations-dir', path.join(TMP_DIR, 'other')], (err, out, code) => {
          assert.ifError(err)
          assert.strictEqual(code, 0, out)

          down(TMP_DIR, ['--migrations-dir', path.join(TMP_DIR, 'other')], (err, out, code) => {
            assert.ifError(err)
            assert.strictEqual(code, 0, out)

            done()
          })
        })
      })
    })
  })

  it('should still allow a relative path', (done) => {
    init(TMP_DIR, ['--migrations-dir', 'other'], (err, out, code) => {
      assert.ifError(err)
      assert.strictEqual(code, 0, out)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'other'))
      })

      create(TMP_DIR, ['--migrations-dir', 'other', 'foo'], (err, out, code) => {
        assert.ifError(err)
        assert.strictEqual(code, 0)

        up(TMP_DIR, ['--migrations-dir', 'other'], (err, out, code) => {
          assert.ifError(err)
          assert.strictEqual(code, 0, out)

          down(TMP_DIR, ['--migrations-dir', 'other'], (err, out, code) => {
            assert.ifError(err)
            assert.strictEqual(code, 0, out)

            done()
          })
        })
      })
    })
  })
})
