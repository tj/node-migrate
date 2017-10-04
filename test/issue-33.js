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

  beforeEach(async function () {
    return migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
    })
    .then((s) => {
      set = s
    })
  })

  it('should run migrations in the correct order', async function () {
    await set.up()
    assert.deepEqual(db.issue33, A1)

    await set.up()
    assert.deepEqual(db.issue33, A1)

    await set.down()
    assert.deepEqual(db.issue33, A2)

    await set.down()
    assert.deepEqual(db.issue33, A2)
  })

  afterEach(function (done) {
    db.nuke()
    fs.unlink(STATE, done)
  })
})
