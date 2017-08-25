/* global describe, it, beforeEach */
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const run = require('./util/run')

// Paths
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')

function reset () {
  rimraf.sync(TMP_DIR)
  mkdirp.sync(TMP_DIR)
}

describe('integration tests', function () {
  beforeEach(reset)

  it('should warn when the migrations are run out of order', function (done) {
    run.init(TMP_DIR, [], function (err, out, code) {
      assert(!err)
      assert.equal(code, 0)

      run.create(TMP_DIR, ['1-one', '-d', 'W'], function (err, out, code) {
        assert(!err)
        assert.equal(code, 0)

        run.create(TMP_DIR, ['3-three', '-d', 'W'], function (err, out, code) {
          assert(!err)
          assert.equal(code, 0)

          run.up(TMP_DIR, [], function (err, out, code) {
            assert(!err)
            assert.equal(code, 0)

            run.create(TMP_DIR, ['2-two', '-d', 'W'], function (err, out, code) {
              assert(!err)
              assert.equal(code, 0)

              run.up(TMP_DIR, [], function (err, out, code) {
                assert(!err)
                assert.equal(code, 0)

                // A warning should log, and the process not exit with 0
                // because migration 2 should come before migration 3,
                // but migration 3 was already run from the previous
                // state
                assert(out.indexOf('warn') !== -1)
                done()
              })
            })
          })
        })
      })
    })
  })
})
