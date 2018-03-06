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

  it('should warn when the migrations are run out of order', async function () {
    let result = await run.init(TMP_DIR, [])
    assert.equal(result.code, 0)
    result = await run.create(TMP_DIR, ['1-one', '-d', 'W'])
    assert.equal(result.code, 0)
    result = await run.create(TMP_DIR, ['3-three', '-d', 'W'])
    assert.equal(result.code, 0)
    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 0)
    result = await run.create(TMP_DIR, ['2-two', '-d', 'W'])
    assert.equal(result.code, 0)
    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 0)

    // A warning should log, and the process not exit with 0
    // because migration 2 should come before migration 3,
    // but migration 3 was already run from the previous
    // state
    assert(result.out.indexOf('warn') !== -1)
  })

  it('should error when migrations are present in the state file, but not loadable', async function () {
    let result = await run.init(TMP_DIR, [])
    assert.equal(result.code, 0)
    result = await run.create(TMP_DIR, ['1-one', '-d', 'W'])
    assert.equal(result.code, 0)
    result = await run.create(TMP_DIR, ['3-three', '-d', 'W'])
    assert.equal(result.code, 0)

    // Keep migration filename to remove
    var filename = result.out.split(' : ')[1].trim()

    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 0)
    // Remove the three migration
    rimraf.sync(filename)
    result = await run.create(TMP_DIR, ['2-two', '-d', 'W'])
    assert.equal(result.code, 0)
    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 1)
    assert(result.out.indexOf('error') !== -1)
  })

  it('should not error when migrations are present in the state file, not loadable but not run', async function () {
    let result = await run.init(TMP_DIR, [])
    assert.equal(result.code, 0)

    result = await run.create(TMP_DIR, ['1-one', '-d', 'W'])
    assert.equal(result.code, 0)

    result = await run.create(TMP_DIR, ['2-two', '-d', 'W'])
    assert.equal(result.code, 0)

    // Keep migration filename to remove
    var filename = result.out.split(' : ')[1].trim()

    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 0)

    result = await run.down(TMP_DIR, [])
    assert.equal(result.code, 0)
    // Remove the three migration
    rimraf.sync(filename)

    result = await run.up(TMP_DIR, [])
    assert.equal(result.code, 0, result.out)
  })

  it('should load the enviroment file when passed --env', async function () {
    let result = await run.up(ENV_DIR, ['--env', 'env'])
    assert.equal(result.code, 0)
    assert(result.out.indexOf('error') === -1)
    result = await run.down(ENV_DIR, ['--env', 'env'])
    assert.equal(result.code, 0)
    assert(result.out.indexOf('error') === -1)
  })
})
