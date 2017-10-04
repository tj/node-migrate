'use strict'

/* global describe, it, beforeEach, afterEach */

const rimraf = require('rimraf')
const path = require('path')
const assert = require('assert')

const migrate = require('../')
const db = require('./util/db')

const BASE = path.join(__dirname, 'fixtures', 'basic')
const STATE = path.join(BASE, '.migrate')

describe('migration set', function () {
  let set

  function assertNoPets () {
    assert.equal(db.pets.length, 0)
  }

  function assertPets () {
    assert.equal(db.pets.length, 3)
    assert.equal(db.pets[0].name, 'tobi')
    assert.equal(db.pets[0].email, 'tobi@learnboost.com')
  }

  function assertPetsWithDogs () {
    assert.equal(db.pets.length, 5)
    assert.equal(db.pets[0].name, 'tobi')
    assert.equal(db.pets[0].email, 'tobi@learnboost.com')
    assert.equal(db.pets[4].name, 'suki')
  };

  function assertFirstMigration () {
    assert.equal(db.pets.length, 2)
    assert.equal(db.pets[0].name, 'tobi')
    assert.equal(db.pets[1].name, 'loki')
  }

  function assertSecondMigration () {
    assert.equal(db.pets.length, 3)
    assert.equal(db.pets[0].name, 'tobi')
    assert.equal(db.pets[1].name, 'loki')
    assert.equal(db.pets[2].name, 'jane')
  }

  beforeEach(function (done) {
    migrate
      .load({
        stateStore: STATE,
        migrationsDirectory: BASE,
        filterFunction: function (each) {
          return each !== '.migrate'
        }
      })
      .then(s => {
        set = s
        done()
      })
      .catch(err => done(err))
  })

  it('should handle basic promise migration', async function () {
    await set.up()
    assertPets()

    await set.up()
    assertPets()

    await set.down()
    assertNoPets()

    await set.down()
    assertNoPets()
  })

  it('should add a new migration', async function () {
    set.addMigration('add dogs', async function () {
      db.pets.push({ name: 'simon' })
      db.pets.push({ name: 'suki' })
    }, async function () {
      db.pets.pop()
      db.pets.pop()
    })

    await set.up()
    assertPetsWithDogs()

    await set.up()
    assertPetsWithDogs()

    await set.down()
    assertNoPets()
  })

  it('should emit events', async function () {
    set.addMigration('4-adjust-emails.js', async function () {
      db.pets.forEach(function (pet) {
        if (pet.email) { pet.email = pet.email.replace('learnboost.com', 'lb.com') }
      })
    }, async function () {
      db.pets.forEach(function (pet) {
        if (pet.email) { pet.email = pet.email.replace('lb.com', 'learnboost.com') }
      })
    })

    let saved = 0
    let migrations = []
    let expectedMigrations = [
      '1-add-guy-ferrets.js',
      '2-add-girl-ferrets.js',
      '3-add-emails.js',
      '4-adjust-emails.js'
    ]

    set.on('save', function () {
      saved++
    })

    set.on('migration', function (migration, direction) {
      migrations.push(migration.title)
      assert.equal(typeof direction, 'string')
    })

    await set.up()

    assert.equal(saved, 4)
    assert.equal(db.pets[0].email, 'tobi@lb.com')
    assert.deepEqual(migrations, expectedMigrations)

    migrations = []
    expectedMigrations = expectedMigrations.reverse()

    await set.down()
    assert.equal(saved, 8)
    assert.deepEqual(migrations, expectedMigrations)
    assertNoPets()
  })

  it('should migrate to named migration', async function () {
    assertNoPets()
    await set.up('1-add-guy-ferrets.js')

    assertFirstMigration()
    await set.up('2-add-girl-ferrets.js')

    assertSecondMigration()
    await set.down('2-add-girl-ferrets.js')

    assertFirstMigration()
    await set.up('2-add-girl-ferrets.js')

    assertSecondMigration()
    assert.equal(set.lastRun, '2-add-girl-ferrets.js')
    await set.down('2-add-girl-ferrets.js')

    assert.equal(set.lastRun, '1-add-guy-ferrets.js')
  })

  it('should load migration descriptions', async function () {
    assert.equal(set.migrations[0].description, 'Adds two pets')
  })

  afterEach(function (done) {
    db.nuke()
    rimraf(STATE, done)
  })
})
