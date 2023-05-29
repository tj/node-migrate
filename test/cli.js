/* eslint-env mocha */
'use strict'
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const { mkdirp } = require('mkdirp')
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
    beforeEach(() => {
      return mkdirp(TMP_DIR)
    })

    it('should create a migrations directory', function (done) {
      init([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations'))
        })
        done()
      })
    })
  }) // end init

  describe('create', function () {
    beforeEach(() => {
      return mkdirp(TMP_DIR)
    })

    it('should create a fixture file', function (done) {
      create(['test'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        const file = out.split(':')[1].trim()
        const content = fs.readFileSync(file, {
          encoding: 'utf8'
        })
        assert(content)
        assert(content.indexOf('module.exports.up') !== -1)
        assert(content.indexOf('module.exports.down') !== -1)
        done()
      })
    })

    it('should respect the --date-format', function (done) {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const now = formatDate(new Date(), fmt)

      create([name, '-d', fmt], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
        })
        done()
      })
    })

    it('should respect the --extension', function (done) {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      create([name, '-d', fmt, '-e', ext], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
        })
        done()
      })
    })

    it('should default the extension to the template file extension', function (done) {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      create([name, '-d', fmt, '-t', path.join(__dirname, 'util', 'tmpl' + ext)], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
        })
        done()
      })
    })

    it('should use the --template-file flag', function (done) {
      create(['test', '-t', path.join(__dirname, 'util', 'tmpl.js')], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0, out)
        assert(out.indexOf('create') !== -1)
        const file = out.split(':')[1].trim()
        const content = fs.readFileSync(file, {
          encoding: 'utf8'
        })
        assert(content.indexOf('test') !== -1)
        done()
      })
    })

    it('should fail with non-zero and a helpful message when template is unreadable', function (done) {
      create(['test', '-t', 'fake'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 1)
        assert(out.indexOf('fake') !== -1)
        done()
      })
    })
  }) // end create

  describe('up', function () {
    it('should run up on multiple migrations', function (done) {
      up([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.strictEqual(db.numbers.length, 2)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) !== -1)
        done()
      })
    })

    it('should run up to a specified migration', function (done) {
      up(['1-one.js'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.strictEqual(db.numbers.length, 1)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run up multiple times', function (done) {
      up([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        up([], function (err, out) {
          assert(!err)
          assert(out.indexOf('up') === -1)
          assert.strictEqual(db.numbers.length, 2)
          done()
        })
      })
    })

    it('should run down when passed --clean', function (done) {
      up([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        up(['--clean'], function (err, out) {
          assert(!err)
          db.load()
          assert(out.indexOf('down') !== -1)
          assert(out.indexOf('up') !== -1)
          assert.strictEqual(db.numbers.length, 2)
          done()
        })
      })
    })
  }) // end up

  describe('down', function () {
    beforeEach(function (done) {
      up([], done)
    })
    it('should run down on multiple migrations', function (done) {
      down([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        db.load()
        assert(out.indexOf('down') !== -1)
        assert.strictEqual(db.numbers.length, 0)
        assert(db.numbers.indexOf(1) === -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run down to a specified migration', function (done) {
      down(['2-two.js'], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        db.load()
        assert(out.indexOf('down') !== -1)
        assert.strictEqual(db.numbers.length, 1)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run down multiple times', function (done) {
      down([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0)
        assert(out.indexOf('down') !== -1)
        db.load()
        down([], function (err, out) {
          assert(!err)
          assert(out.indexOf('down') === -1)
          assert.strictEqual(db.numbers.length, 0)
          done()
        })
      })
    })
  }) // end down

  describe('list', function () {
    it('should list available migrations', function (done) {
      list([], function (err, out, code) {
        assert(!err)
        assert.strictEqual(code, 0, out)
        assert(out.indexOf('1-one.js') !== -1)
        assert(out.indexOf('2-two.js') !== -1)
        done()
      })
    })
  }) // end init
})
