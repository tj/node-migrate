/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const run = require('./util/run')
const db = require('./util/db')

// Paths
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')
const ENV_DIR = path.join(__dirname, 'fixtures', 'env')

function reset () {
  rimraf.sync(path.join(ENV_DIR, '.migrate'))
  rimraf.sync(TMP_DIR)
  mkdirp.sync(TMP_DIR)
  db.nuke()
}

describe('integration tests', function () {
  beforeEach(reset)
  afterEach(reset)

  it('should warn when the migrations are run out of order', function (done) {
    run.init(TMP_DIR, [], function (err, out, code) {
      assert(!err)
      assert.strictEqual(code, 0)

      run.create(TMP_DIR, ['1-one', '-d', 'W'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)

        run.create(TMP_DIR, ['3-three', '-d', 'W'], function (err, out, code) {
          assert(!err)
          assert.strictEqual(code, 0)

          run.up(TMP_DIR, [], function (err, out, code) {
            assert(!err)
            assert.strictEqual(code, 0)

            run.create(TMP_DIR, ['2-two', '-d', 'W'], function (err, out, code) {
              assert(!err)
              assert.strictEqual(code, 0)

              run.up(TMP_DIR, [], function (err, out, code) {
                assert(!err)
                assert.strictEqual(code, 0)

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

  it('should error when migrations are present in the state file, but not loadable', function (done) {
    run.init(TMP_DIR, [], function (err, out, code) {
      assert(!err)
      assert.strictEqual(code, 0)

      run.create(TMP_DIR, ['1-one', '-d', 'W'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)

        run.create(TMP_DIR, ['3-three', '-d', 'W'], function (err, out, code) {
          assert(!err)
          assert.strictEqual(code, 0)

          // Keep migration filename to remove
          const filename = out.split(' : ')[1].trim()

          run.up(TMP_DIR, [], function (err, out, code) {
            assert(!err)
            assert.strictEqual(code, 0)

            // Remove the three migration
            rimraf.sync(filename)

            run.create(TMP_DIR, ['2-two', '-d', 'W'], function (err, out, code) {
              assert(!err)
              assert.strictEqual(code, 0)

              run.up(TMP_DIR, [], function (err, out, code) {
                assert(!err)
                assert.strictEqual(code, 1)
                assert(out.indexOf('error') !== -1)
                done()
              })
            })
          })
        })
      })
    })
  })

  it('should not error when migrations are present in the state file, not loadable but not run', function (done) {
    run.init(TMP_DIR, [], function (err, out, code) {
      assert(!err)
      assert.strictEqual(code, 0)

      run.create(TMP_DIR, ['1-one', '-d', 'W'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)

        run.create(TMP_DIR, ['2-two', '-d', 'W'], function (err, out, code) {
          assert(!err)
          assert.strictEqual(code, 0)

          // Keep migration filename to remove
          const filename = out.split(' : ')[1].trim()

          run.up(TMP_DIR, [], function (err, out, code) {
            assert(!err)
            assert.strictEqual(code, 0)

            run.down(TMP_DIR, [], function (err, out, code) {
              assert(!err)
              assert.strictEqual(code, 0)

              // Remove the three migration
              rimraf.sync(filename)

              run.up(TMP_DIR, [], function (err, out, code) {
                assert(!err)
                assert.strictEqual(code, 0, out)
                done()
              })
            })
          })
        })
      })
    })
  })

  it('should load the enviroment file when passed --env', function (done) {
    run.up(ENV_DIR, ['--env', 'env'], function (err, out, code) {
      assert(!err)
      assert.strictEqual(code, 0)
      assert(out.indexOf('error') === -1)
      run.down(ENV_DIR, ['--env', 'env'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert(out.indexOf('error') === -1)
        done()
      })
    })
  })
})
