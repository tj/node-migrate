'use strict'

/* global describe, it, beforeEach, afterEach */

const path = require('path')
const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const formatDate = require('dateformat')
const db = require('./util/db')
const run = require('./util/run')

// Paths
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')
const FIX_DIR = path.join(__dirname, 'fixtures', 'numbers')

function reset () {
  rimraf.sync(TMP_DIR)
  rimraf.sync(path.join(FIX_DIR, '.migrate'))
  db.nuke()
}

describe('$ migrate', function () {
  beforeEach(reset)
  afterEach(reset)

  describe('init', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a migrations directory', async function () {
      await run.init(TMP_DIR, [])

      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations'))
      })
    })
  }) // end init

  describe('create', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a fixture file', async function () {
      const output = await run.create(TMP_DIR, ['test'])

      const file = output.split('create :')[1].trim()
      const content = fs.readFileSync(file, {
        encoding: 'utf8'
      })
      assert(content)
      assert(content.indexOf('module.exports.up') !== -1)
      assert(content.indexOf('module.exports.down') !== -1)
    })

    it('should respect the --date-format', async function () {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const now = formatDate(new Date(), fmt)

      await run.create(TMP_DIR, [name, '-d', fmt])

      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
      })
    })

    it('should respect the --extention', async function () {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      await run.create(TMP_DIR, [name, '-d', fmt, '-e', ext])

      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
      })
    })

    it('should fail with non-zero and a helpful message when template is unreadable', async function () {
      try {
        await run.create(TMP_DIR, ['test', '-t', 'fake'])
      } catch (error) {
        assert(error.message.indexOf('fake') !== -1)
        return
      }

      assert.fail('Did not produce expected error')
    })
  }) // end create

  describe('up', function () {
    it('should run up on multiple migrations', async function () {
      const output = await run.up(FIX_DIR, ['--migrations-dir _migrations'])

      db.load()
      assert(output.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') !== -1)
    })

    it('should run up to a specified migration', async function () {
      const output = await run.up(FIX_DIR, ['1-one.js', '--migrations-dir _migrations'])

      db.load()
      assert(output.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run up multiple times', async function () {
      const firstOuput = await run.up(FIX_DIR, ['--migrations-dir _migrations'])
      db.load()
      assert(firstOuput.indexOf('up') !== -1)

      const secondOutput = await run.up(FIX_DIR, ['--migrations-dir _migrations'])

      db.load()
      assert(secondOutput.indexOf('up') === -1)
      assert.equal(db.numbers.length, 2)
    })

    it('should run down when passed --clean', async function () {
      await run.up(FIX_DIR, ['--migrations-dir _migrations'])

      const secondOutput = await run.up(FIX_DIR, ['--clean', '--migrations-dir _migrations'])
      db.load()
      assert(secondOutput.indexOf('down') !== -1)
      assert(secondOutput.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
    })
  }) // end up

  describe('down', function () {
    beforeEach(async function () {
      return run.up(FIX_DIR, ['--migrations-dir _migrations'])
    })

    it('should run down on multiple migrations', async function () {
      const output = await run.down(FIX_DIR, ['--migrations-dir _migrations'])

      db.load()
      assert(output.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 0)
      assert(db.numbers.indexOf('1-up') === -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run down to a specified migration', async function () {
      db.load()

      const output = await run.down(FIX_DIR, ['2-two.js', '--migrations-dir _migrations'])

      db.load()

      assert(output.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run down multiple times', async function () {
      const firstOuput = await run.down(FIX_DIR, ['--migrations-dir _migrations'])
      assert(firstOuput.indexOf('down') !== -1)
      db.load()

      const secondOutput = await run.down(FIX_DIR, ['--migrations-dir _migrations'])
      assert(secondOutput.indexOf('down') === -1)
      assert.equal(db.numbers.length, 0)
    })
  }) // end down

  describe('list', function () {
    it('should list available migrations', async function () {
      const output = await run.list(FIX_DIR, ['--migrations-dir _migrations'])

      assert(output.indexOf('1-one.js') !== -1)
      assert(output.indexOf('2-two.js') !== -1)
    })
  }) // end init
})
