/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const db = require('./util/db')
const run = require('./util/run')

// Paths
const FIX_DIR = path.join(__dirname, 'fixtures', 'issue-92')
const UP = path.join(__dirname, '..', 'bin', 'migrate-up')
const DOWN = path.join(__dirname, '..', 'bin', 'migrate-down')

// Run helper
const up = run.bind(null, UP, FIX_DIR)
const down = run.bind(null, DOWN, FIX_DIR)

function reset () {
  rimraf.sync(path.join(FIX_DIR, '.migrate'))
  db.nuke()
}

describe('issue #92', function () {
  beforeEach(reset)
  afterEach(reset)

  it('shouldn\'t throw error after migrate down to initial state', function (done) {
    up([], function (err, out, code) {
      assert.ifError(err)
      assert.equal(code, 0)

      down([], function (err, out, code) {
        assert.ifError(err)
        assert.equal(code, 0)

        up([], function (err, out, code) {
          assert.ifError(err)
          assert.equal(code, 0)

          done()
        })
      })
    })
  })
})
