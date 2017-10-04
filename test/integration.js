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

  it('should warn when the migrations are run out of order', async function () {
    await run.init(TMP_DIR, [])

    await run.create(TMP_DIR, ['1-one', '-d', 'W'])

    await run.create(TMP_DIR, ['3-three', '-d', 'W'])

    await run.up(TMP_DIR, [])

    await run.create(TMP_DIR, ['2-two', '-d', 'W'])

    let output = await run.up(TMP_DIR, [])

    // A warning should log,
    // because migration 2 should come before migration 3,
    // but migration 3 was already run from the previous
    // state
    assert(output.indexOf('warn') !== -1)
  })

  it('should error when migrations are present in the state file, but not loadable', async function () {
    await run.init(TMP_DIR, [])

    await run.create(TMP_DIR, ['1-one', '-d', 'W'])

    let firstOut = await run.create(TMP_DIR, ['3-three', '-d', 'W'])
    // Keep migration filename to remove
    var filename = firstOut.split(' : ')[1].trim()

    await run.up(TMP_DIR, [])

    // Remove the three migration
    rimraf.sync(filename)

    await run.create(TMP_DIR, ['2-two', '-d', 'W'])

    try {
      await run.up(TMP_DIR, [])
    } catch (error) {
      assert(error.message.indexOf('error') !== -1)
      return
    }

    assert.fail('Should throw error')
  })
})
