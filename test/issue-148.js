/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const fs = require('fs')
const os = require('os')
const db = require('./util/db')
const run = require('./util/run')

const ABSOLUTE_DIR = path.join(os.tmpdir(), 'issue-#148')

describe('issue #148 - `migrate create --migrations-dir=... foo` should allow an absolute path', () => {
  let absolutePath

  function reset () {
    if (!absolutePath) return

    rimraf.sync(absolutePath)
    db.nuke()
  }

  beforeEach(reset)
  afterEach(reset)

  it('should allow an absolute path', (done) => {
    absolutePath = ABSOLUTE_DIR

    run.create(path.resolve(), ['--migrations-dir', absolutePath, 'foo'], (err, out, code) => {
      assert.ifError(err)
      assert.equal(code, 0)

      done()
    })
  })

  it('should still allow a relative path', (done) => {
    const relativeDir = 'fixtures/issue-148'

    absolutePath = path.join(__dirname, relativeDir)

    run.create(__dirname, ['--migrations-dir', relativeDir, 'foo'], (err, out, code) => {
      assert.ifError(err)
      assert.equal(code, 0)

      const atLeastOneFileWasCreatedInRelativeDir = fs
        .readdirSync(absolutePath)
        .length > 0

      assert(atLeastOneFileWasCreatedInRelativeDir)

      done()
    })
  })
})
