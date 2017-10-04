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
const UP = path.join(__dirname, '..', 'bin', 'migrate-up')
const DOWN = path.join(__dirname, '..', 'bin', 'migrate-down')
const CREATE = path.join(__dirname, '..', 'bin', 'migrate-create')
const INIT = path.join(__dirname, '..', 'bin', 'migrate-init')
const LIST = path.join(__dirname, '..', 'bin', 'migrate-list')

// Run helper
const up = (args, dir, cb) => run.bind(null, UP, dir)(args, cb)
const down = (args, dir, cb) => run.bind(null, DOWN, dir)(args, cb)
const create = (args, dir, cb) => run.bind(null, CREATE, dir)(args, cb)
const init = (args, dir, cb) => run.bind(null, INIT, dir)(args, cb)
const list = (args, dir, cb) => run.bind(null, LIST, dir)(args, cb)

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
      const output = await init([], TMP_DIR)

      assert.equal(output.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations'))
      })
    })
  }) // end init

  describe('create', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a fixture file', async function () {
      const output = await create(['test'], TMP_DIR)

      assert.equal(output.code, 0)
      const file = output.stdout.split('create :')[1].trim()
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

      const output = await create([name, '-d', fmt], TMP_DIR)

      assert.equal(output.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
      })
    })

    it('should respect the --extention', async function () {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      const output = await create([name, '-d', fmt, '-e', ext], TMP_DIR)
      assert.equal(output.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
      })
    })

    it('should fail with non-zero and a helpful message when template is unreadable', async function () {
      try {
        await create(['test', '-t', 'fake'], TMP_DIR)
      } catch (error) {
        assert(error.message.indexOf('fake') !== -1)
        return
      }

      assert.fail('Did not produce expected error')
    })
  }) // end create

  describe('up', function () {
    it('should run up on multiple migrations', async function () {
      const output = await up(['--migrations-dir _migrations'], FIX_DIR)
      assert.equal(output.code, 0)
      db.load()
      assert(output.stdout.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') !== -1)
    })

    it('should run up to a specified migration', async function () {
      const output = await up(['1-one.js', '--migrations-dir _migrations'], FIX_DIR)
      assert.equal(output.code, 0)
      db.load()
      assert(output.stdout.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run up multiple times', async function () {
      const firstOuput = await up(['--migrations-dir _migrations'], FIX_DIR)
      assert.equal(firstOuput.code, 0)
      db.load()
      assert(firstOuput.stdout.indexOf('up') !== -1)

      const secondOutput = await up(['--migrations-dir _migrations'], FIX_DIR)

      db.load()
      assert(secondOutput.stdout.indexOf('up') === -1)
      assert.equal(db.numbers.length, 2)
    })

    it('should run down when passed --clean', async function () {
      const firstOuput = await up(['--migrations-dir _migrations'], FIX_DIR)

      assert.equal(firstOuput.code, 0)
      const secondOutput = await up(['--clean', '--migrations-dir _migrations'], FIX_DIR)
      db.load()
      assert(secondOutput.stdout.indexOf('down') !== -1)
      assert(secondOutput.stdout.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
    })
  }) // end up

  describe('down', function () {
    beforeEach(async function () {
      return up(['--migrations-dir _migrations'], FIX_DIR)
    })

    it('should run down on multiple migrations', async function () {
      const output = await down(['--migrations-dir _migrations'], FIX_DIR)
      assert.equal(output.code, 0)
      db.load()
      assert(output.stdout.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 0)
      assert(db.numbers.indexOf('1-up') === -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run down to a specified migration', async function () {
      db.load()

      const output = await down(['2-two.js', '--migrations-dir _migrations'], FIX_DIR)

      db.load()
      assert.equal(output.code, 0)
      assert(output.stdout.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf('1-up') !== -1)
      assert(db.numbers.indexOf('2-up') === -1)
    })

    it('should run down multiple times', async function () {
      const firstOuput = await down(['--migrations-dir _migrations'], FIX_DIR)
      assert.equal(firstOuput.code, 0)
      assert(firstOuput.stdout.indexOf('down') !== -1)
      db.load()

      const secondOutput = await down(['--migrations-dir _migrations'], FIX_DIR)
      assert(secondOutput.stdout.indexOf('down') === -1)
      assert.equal(db.numbers.length, 0)
    })
  }) // end down

  describe('list', function () {
    it('should list available migrations', async function () {
      const output = await list(['--migrations-dir _migrations'], FIX_DIR)

      assert.equal(output.code, 0)
      assert(output.stdout.indexOf('1-one.js') !== -1)
      assert(output.stdout.indexOf('2-two.js') !== -1)
    })
  }) // end init
})
