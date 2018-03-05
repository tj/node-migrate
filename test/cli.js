/* eslint-env mocha */
'use strict'
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const formatDate = require('dateformat')
const db = require('./util/db')
const run = require('./util/run')

// Paths
const FIX_DIR = path.join(__dirname, 'fixtures', 'numbers')
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp')
const UP = path.join(__dirname, '..', 'bin', 'migrate-up')
const DOWN = path.join(__dirname, '..', 'bin', 'migrate-down')
const CREATE = path.join(__dirname, '..', 'bin', 'migrate-create')
const INIT = path.join(__dirname, '..', 'bin', 'migrate-init')
const LIST = path.join(__dirname, '..', 'bin', 'migrate-list')

// Run helper
const up = run.bind(null, UP, FIX_DIR)
const down = run.bind(null, DOWN, FIX_DIR)
const create = run.bind(null, CREATE, TMP_DIR)
const init = run.bind(null, INIT, TMP_DIR)
const list = run.bind(null, LIST, FIX_DIR)

function reset () {
  rimraf.sync(path.join(FIX_DIR, '.migrate'))
  rimraf.sync(TMP_DIR)
  db.nuke()
}

describe('$ migrate', function () {
  beforeEach(reset)
  afterEach(reset)

  describe('init', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a migrations directory', async function () {
      let result = await init([])
      assert.equal(result.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations'))
      })
    })
  }) // end init

  describe('create', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a fixture file', async function () {
      let result = await create(['test'])
      assert.equal(result.code, 0)
      var file = result.out.split(':')[1].trim()
      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      })
      assert(content)
      assert(content.indexOf('module.exports.up') !== -1)
      assert(content.indexOf('module.exports.down') !== -1)
    })

    it('should respect the --date-format', async function () {
      var name = 'test'
      var fmt = 'yyyy-mm-dd'
      var now = formatDate(new Date(), fmt)

      let result = await create([name, '-d', fmt])
      assert.equal(result.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
      })
    })

    it('should respect the --extention', async function () {
      var name = 'test'
      var fmt = 'yyyy-mm-dd'
      var ext = '.mjs'
      var now = formatDate(new Date(), fmt)

      let result = await create([name, '-d', fmt, '-e', ext])
      assert.equal(result.code, 0)
      assert.doesNotThrow(() => {
        fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
      })
    })

    it('should use the --template-file flag', async function () {
      let result = await create(['test', '-t', path.join(__dirname, 'util', 'tmpl.js')])
      assert.equal(result.code, 0, result.out)
      assert(result.out.indexOf('create') !== -1)
      var file = result.out.split(':')[1].trim()
      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      })
      assert(content.indexOf('test') !== -1)
    })

    it('should fail with non-zero and a helpful message when template is unreadable', async function () {
      let result = await create(['test', '-t', 'fake'])
      assert.equal(result.code, 1)
      assert(result.out.indexOf('fake') !== -1)
    })
  }) // end create

  describe('up', function () {
    it('should run up on multiple migrations', async function () {
      let result = await up([])
      assert.equal(result.code, 0)
      db.load()
      assert(result.out.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
      assert(db.numbers.indexOf(1) !== -1)
      assert(db.numbers.indexOf(2) !== -1)
    })

    it('should run up to a specified migration', async function () {
      let result = await up(['1-one.js'])
      assert.equal(result.code, 0)
      db.load()
      assert(result.out.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf(1) !== -1)
      assert(db.numbers.indexOf(2) === -1)
    })

    it('should run up multiple times', async function () {
      let result = await up([])
      assert.equal(result.code, 0)
      db.load()
      assert(result.out.indexOf('up') !== -1)
      result = await up([])
      assert(result.out.indexOf('up') === -1)
      assert.equal(db.numbers.length, 2)
    })

    it('should run down when passed --clean', async function () {
      let result = await up([])
      assert.equal(result.code, 0)
      result = await up(['--clean'])
      db.load()
      assert(result.out.indexOf('down') !== -1)
      assert(result.out.indexOf('up') !== -1)
      assert.equal(db.numbers.length, 2)
    })
  }) // end up

  describe('down', function () {
    beforeEach(async function () {
      await up([])
    })
    it('should run down on multiple migrations', async function () {
      let result = await down([])
      assert.equal(result.code, 0)
      db.load()
      assert(result.out.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 0)
      assert(db.numbers.indexOf(1) === -1)
      assert(db.numbers.indexOf(2) === -1)
    })

    it('should run down to a specified migration', async function () {
      let result = await down(['2-two.js'])
      assert.equal(result.code, 0)
      db.load()
      assert(result.out.indexOf('down') !== -1)
      assert.equal(db.numbers.length, 1)
      assert(db.numbers.indexOf(1) !== -1)
      assert(db.numbers.indexOf(2) === -1)
    })

    it('should run down multiple times', async function () {
      let result = await down([])
      assert.equal(result.code, 0)
      assert(result.out.indexOf('down') !== -1)
      db.load()
      result = await down([])
      assert(result.out.indexOf('down') === -1)
      assert.equal(db.numbers.length, 0)
    })
  }) // end down

  describe('list', function () {
    it('should list available migrations', async function () {
      let result = await list([])
      assert.equal(result.code, 0, result.out)
      assert(result.out.indexOf('1-one.js') !== -1)
      assert(result.out.indexOf('2-two.js') !== -1)
    })
  }) // end init
})
