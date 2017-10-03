'use strict'

/* global describe, it, beforeEach, afterEach */

const fs = require('fs')
const path = require('path')
const assert = require('assert')

const migrate = require('../')
const db = require('./util/db')

const BASE = path.join(__dirname, 'fixtures', 'issue-33')
const STATE = path.join(BASE, '.migrate')

const A1 = ['1-up', '2-up', '3-up']
const A2 = A1.concat(['3-down', '2-down', '1-down'])

describe('issue #33', function () {
  let set

  beforeEach(function (done) {
    migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
    }, function (err, s) {
      set = s
      done(err)
    })
  })

  it('should run migrations in the correct order', function (done) {
    set.up(function (err) {
      assert.ifError(err)
      assert.deepEqual(db.issue33, A1)

      set.up(function (err) {
        assert.ifError(err)
        assert.deepEqual(db.issue33, A1)

        set.down(function (err) {
          assert.ifError(err)
          assert.deepEqual(db.issue33, A2)

          set.down(function (err) {
            assert.ifError(err)
            assert.deepEqual(db.issue33, A2)

            done()
          })
        })
      })
    })
  })

  afterEach(function (done) {
    db.nuke()
    fs.unlink(STATE, done)
  })
})
