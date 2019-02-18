/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const os = require('os')
const db = require('./util/db')
const run = require('./util/run')

const ABSOLUTE_DIR = path.join(os.tmpdir(), 'issue-#148')

function reset () {
  rimraf.sync(ABSOLUTE_DIR)
  db.nuke()
}

describe('issue #148 - `migrate create --migrations-dir=... foo` should allow an absolute path', () => {
  beforeEach(reset)
  afterEach(reset)

  it('should allow an absolute path', (done) => {
    run.create(path.resolve(), ['--migrations-dir', ABSOLUTE_DIR, 'foo'], (err, out, code) => {
      assert.ifError(err)
      assert.equal(code, 0)

      done()
    })
  })
})
