
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var migrate = require('../');
var db = require('./fixtures/db');

var BASE = path.join(__dirname, 'fixtures', 'basic');
var STATE = path.join(BASE, '.migrate');

describe('migrate', function () {

  var set;

  function assertNoPets() {
    assert.equal(db.pets.length, 0);
    assert.equal(set.pos, 0);
  }

  function assertPets() {
    assert.equal(db.pets.length, 3);
    assert.equal(db.pets[0].name, 'tobi');
    assert.equal(db.pets[0].email, 'tobi@learnboost.com');
    assert.equal(set.pos, 3);
  }

  function assertPetsWithDogs() {
    assert.equal(db.pets.length, 5);
    assert.equal(db.pets[0].name, 'tobi');
    assert.equal(db.pets[0].email, 'tobi@learnboost.com');
    assert.equal(db.pets[4].name, 'suki');
  };

  function assertFirstMigration() {
    assert.equal(db.pets.length, 2);
    assert.equal(db.pets[0].name, 'tobi');
    assert.equal(db.pets[1].name, 'loki');
    assert.equal(set.pos, 1);
  }

  function assertSecondMigration() {
    assert.equal(db.pets.length, 3);
    assert.equal(db.pets[0].name, 'tobi');
    assert.equal(db.pets[1].name, 'loki');
    assert.equal(db.pets[2].name, 'jane');
    assert.equal(set.pos, 2);
  }

  beforeEach(function () {
    set = migrate.load(STATE, BASE);
  });

  it('should handle basic migration', function (done) {

    set.up(function (err) {
      assert.ifError(err);
      assertPets();
      set.up(function (err) {
        assert.ifError(err);
        assertPets();
        set.down(function (err) {
          assert.ifError(err);
          assertNoPets();
          set.down(function (err) {
            assert.ifError(err);
            assertNoPets();
            set.up(function (err) {
              assert.ifError(err);
              assertPets();
              done();
            });
          });
        });
      });
    });

  });

  it('should add a new migration', function (done) {

    set.addMigration('add dogs', function (next) {
      db.pets.push({ name: 'simon' });
      db.pets.push({ name: 'suki' });
      next();
    }, function (next) {
      db.pets.pop();
      db.pets.pop();
      next();
    });

    set.up(function (err) {
      assert.ifError(err);
      assertPetsWithDogs();
      set.up(function (err) {
        assert.ifError(err);
        assertPetsWithDogs();
        set.down(function (err) {
          assert.ifError(err);
          assertNoPets();
          done();
        });
      });
    });

  });

  it('should emit events', function (done) {

    set.addMigration('4-adjust-emails.js', function (next) {
      db.pets.forEach(function (pet) {
        if (pet.email)
          pet.email = pet.email.replace('learnboost.com', 'lb.com');
      });
      next();
    }, function (next) {
      db.pets.forEach(function (pet) {
        if (pet.email)
          pet.email = pet.email.replace('lb.com', 'learnboost.com');
      });
      next();
    });

    var saved = 0;
    var migrations = [];
    var expectedMigrations = [
      '1-add-guy-ferrets.js',
      '2-add-girl-ferrets.js',
      '3-add-emails.js',
      '4-adjust-emails.js'
    ];

    set.on('save', function () {
      saved++;
    });

    set.on('migration', function (migration, direction) {
      migrations.push(migration.title);
      assert.equal(typeof direction, 'string');
    });

    set.up(function (err) {
      assert.ifError(err);
      assert.equal(saved, 4);
      assert.equal(db.pets[0].email, 'tobi@lb.com');
      assert.deepEqual(migrations, expectedMigrations);

      migrations = [];
      expectedMigrations = expectedMigrations.reverse();

      set.down(function (err) {
        assert.ifError(err);
        assert.equal(saved, 8);
        assert.deepEqual(migrations, expectedMigrations);
        assertNoPets();
        done();
      });

    });

  });

  it('should migrate to named migration', function (done) {

    assertNoPets();
    set.up('1-add-guy-ferrets.js', function (err) {
      assert.ifError(err);
      assertFirstMigration();
      set.up('2-add-girl-ferrets.js', function (err) {
        assert.ifError(err);
        assertSecondMigration();
        set.down('2-add-girl-ferrets.js', function (err) {
          assert.ifError(err);
          assertFirstMigration();
          set.up('2-add-girl-ferrets.js', function (err) {
            assert.ifError(err);
            assertSecondMigration();
            set.down('2-add-girl-ferrets.js', function (err) {
              assert.ifError(err);
              assert.equal(set.pos, 1);
              done();
            });
          });
        });
      });
    });

  });

  afterEach(function (done) {
    db.nuke();
    fs.unlink(STATE, done);
  });

});
