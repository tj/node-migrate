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

    it('should create a migrations directory', function (done) {
      init([], TMP_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations'))
        })
        done()
      })
    })
  }) // end init

  describe('create', function () {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a fixture file', function (done) {
      create(['test'], TMP_DIR, function (err, out, code) {
        if (err) {
          done(err)
        }
        assert.equal(code, 0)
        const file = out.split('create :')[1].trim()
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

      create([name, '-d', fmt], TMP_DIR, function (err, out, code) {
        if (err) {
          done(err)
        }
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
        })
        done()
      })
    })

    it('should respect the --extention', function (done) {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      create([name, '-d', fmt, '-e', ext], TMP_DIR, function (err, out, code) {
        if (err) {
          done(err)
        }
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
        })
        done()
      })
    })

    it('should fail with non-zero and a helpful message when template is unreadable', function (done) {
      create(['test', '-t', 'fake'], TMP_DIR, function (err, out, code) {
        assert.ok(err)
        assert.equal(code, 1)
        assert(out.indexOf('fake') !== -1)
        done()
      })
    })
  }) // end create

  describe('up', function () {
    it('should run up on multiple migrations', function (done) {
      up(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.equal(db.numbers.length, 2)
        assert(db.numbers.indexOf('1-up') !== -1)
        assert(db.numbers.indexOf('2-up') !== -1)
        done()
      })
    })

    it('should run up to a specified migration', function (done) {
      up(['1-one.js', '--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.equal(db.numbers.length, 1)
        assert(db.numbers.indexOf('1-up') !== -1)
        assert(db.numbers.indexOf('2-up') === -1)
        done()
      })
    })

    it('should run up multiple times', function (done) {
      up(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)

        up(['--migrations-dir _migrations'], FIX_DIR, function (err, out) {
          if (err) {
            return done(err)
          }

          db.load()
          assert(out.indexOf('up') === -1)
          assert.equal(db.numbers.length, 2)
          done()
        })
      })
    })

    it('should run down when passed --clean', function (done) {
      up(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }

        assert.equal(code, 0)
        up(['--clean', '--migrations-dir _migrations'], FIX_DIR, function (err, out) {
          if (err) {
            return done(err)
          }
          db.load()
          assert(out.indexOf('down') !== -1)
          assert(out.indexOf('up') !== -1)
          assert.equal(db.numbers.length, 2)
          done()
        })
      })
    })
  }) // end up

  describe('down', function () {
    beforeEach(function (done) {
      up(['--migrations-dir _migrations'], FIX_DIR, done)
    })

    it('should run down on multiple migrations', function (done) {
      down(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('down') !== -1)
        assert.equal(db.numbers.length, 0)
        assert(db.numbers.indexOf('1-up') === -1)
        assert(db.numbers.indexOf('2-up') === -1)
        done()
      })
    })

    it('should run down to a specified migration', function (done) {
      db.load()

      down(['2-two.js', '--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }

        db.load()
        assert.equal(code, 0)
        assert(out.indexOf('down') !== -1)
        assert.equal(db.numbers.length, 1)
        assert(db.numbers.indexOf('1-up') !== -1)
        assert(db.numbers.indexOf('2-up') === -1)
        done()
      })
    })

    it('should run down multiple times', function (done) {
      down(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }
        assert.equal(code, 0)
        assert(out.indexOf('down') !== -1)
        db.load()
        down(['--migrations-dir _migrations'], FIX_DIR, function (err, out) {
          if (err) {
            return done(err)
          }
          assert(out.indexOf('down') === -1)
          assert.equal(db.numbers.length, 0)
          done()
        })
      })
    })
  }) // end down

  describe('list', function () {
    it('should list available migrations', function (done) {
      list(['--migrations-dir _migrations'], FIX_DIR, function (err, out, code) {
        if (err) {
          return done(err)
        }

        assert.equal(code, 0)
        assert(out.indexOf('1-one.js') !== -1)
        assert(out.indexOf('2-two.js') !== -1)
        done()
      })
    })
  }) // end init
})
