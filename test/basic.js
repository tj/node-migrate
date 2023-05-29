/* eslint-env mocha */
'use strict'
const { rimraf } = require('rimraf')
const path = require('path')
const assert = require('assert')
const migrate = require('../')
const db = require('./util/db')

const BASE = path.join(__dirname, 'fixtures', 'basic')
const STATE = path.join(BASE, '.migrate')

describe('migration set', function () {
  let set

  function assertNoPets () {
    assert.strictEqual(db.pets.length, 0)
  }

  function assertPets () {
    assert.strictEqual(db.pets.length, 3)
    assert.strictEqual(db.pets[0].name, 'tobi')
    assert.strictEqual(db.pets[0].email, 'tobi@learnboost.com')
  }

  function assertPetsWithDogs () {
    assert.strictEqual(db.pets.length, 5)
    assert.strictEqual(db.pets[0].name, 'tobi')
    assert.strictEqual(db.pets[0].email, 'tobi@learnboost.com')
    assert.strictEqual(db.pets[4].name, 'suki')
  }

  function assertFirstMigration () {
    assert.strictEqual(db.pets.length, 2)
    assert.strictEqual(db.pets[0].name, 'tobi')
    assert.strictEqual(db.pets[1].name, 'loki')
  }

  function assertSecondMigration () {
    assert.strictEqual(db.pets.length, 3)
    assert.strictEqual(db.pets[0].name, 'tobi')
    assert.strictEqual(db.pets[1].name, 'loki')
    assert.strictEqual(db.pets[2].name, 'jane')
  }

  beforeEach(function (done) {
    migrate.load(
      {
        stateStore: STATE,
        migrationsDirectory: BASE
      },
      function (err, s) {
        set = s
        done(err)
      }
    )
  })

  it('should handle basic migration', function (done) {
    set.up(function (err) {
      assert.ifError(err)
      assertPets()
      set.up(function (err) {
        assert.ifError(err)
        assertPets()
        set.down(function (err) {
          assert.ifError(err)
          assertNoPets()
          set.down(function (err) {
            assert.ifError(err)
            assertNoPets()
            set.up(function (err) {
              assert.ifError(err)
              assertPets()
              done()
            })
          })
        })
      })
    })
  })

  it('should add a new migration', function (done) {
    set.addMigration(
      'add dogs',
      function (next) {
        db.pets.push({ name: 'simon' })
        db.pets.push({ name: 'suki' })
        next()
      },
      function (next) {
        db.pets.pop()
        db.pets.pop()
        next()
      }
    )

    set.up(function (err) {
      assert.ifError(err)
      assertPetsWithDogs()
      set.up(function (err) {
        assert.ifError(err)
        assertPetsWithDogs()
        set.down(function (err) {
          assert.ifError(err)
          assertNoPets()
          done()
        })
      })
    })
  })

  it('should emit events', function (done) {
    set.addMigration(
      '4-adjust-emails.js',
      function (next) {
        db.pets.forEach(function (pet) {
          if (pet.email) {
            pet.email = pet.email.replace('learnboost.com', 'lb.com')
          }
        })
        next()
      },
      function (next) {
        db.pets.forEach(function (pet) {
          if (pet.email) {
            pet.email = pet.email.replace('lb.com', 'learnboost.com')
          }
        })
        next()
      }
    )

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
      assert.strictEqual(typeof direction, 'string')
    })

    set.up(function (err) {
      assert.ifError(err)
      assert.strictEqual(saved, 4)
      assert.strictEqual(db.pets[0].email, 'tobi@lb.com')
      assert.deepStrictEqual(migrations, expectedMigrations)

      migrations = []
      expectedMigrations = expectedMigrations.reverse()

      set.down(function (err) {
        assert.ifError(err)
        assert.strictEqual(saved, 8)
        assert.deepStrictEqual(migrations, expectedMigrations)
        assertNoPets()
        done()
      })
    })
  })

  it('should migrate to named migration', function (done) {
    assertNoPets()
    set.up('1-add-guy-ferrets.js', function (err) {
      assert.ifError(err)
      assertFirstMigration()
      set.up('2-add-girl-ferrets.js', function (err) {
        assert.ifError(err)
        assertSecondMigration()
        set.down('2-add-girl-ferrets.js', function (err) {
          assert.ifError(err)
          assertFirstMigration()
          set.up('2-add-girl-ferrets.js', function (err) {
            assert.ifError(err)
            assertSecondMigration()
            assert.strictEqual(set.lastRun, '2-add-girl-ferrets.js')
            set.down('2-add-girl-ferrets.js', function (err) {
              assert.ifError(err)
              assert.strictEqual(set.lastRun, '1-add-guy-ferrets.js')
              done()
            })
          })
        })
      })
    })
  })

  it('should load migration descriptions', function () {
    assert.strictEqual(set.migrations[0].description, 'Adds two pets')
  })

  afterEach(function () {
    db.nuke()
    return rimraf(STATE)
  })
})
