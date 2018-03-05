/* eslint-env mocha */
'use strict'
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const migrate = require('../')
const db = require('./util/db')

const BASE = path.join(__dirname, 'fixtures', 'issue-33')
const STATE = path.join(BASE, '.migrate')

var A1 = ['1-up', '2-up', '3-up']
var A2 = A1.concat(['3-down', '2-down', '1-down'])

describe('down command twice', function () {
  var set

  beforeEach(async function () {
    set = await migrate.load({
      stateStore: STATE,
      migrationsDirectory: BASE
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

  afterEach(function () {
    db.nuke()
    fs.unlinkSync(STATE)
  })
})
