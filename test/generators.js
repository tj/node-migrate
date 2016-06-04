
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var migrate = require('../');
var db = require('./fixtures/db');

var BASE = path.join(__dirname, 'fixtures', 'generators');
var STATE = path.join(BASE, '.migrate');

describe('migrate (with generators)', function () {

  var set;

  beforeEach(function () {
    set = migrate.load(STATE, BASE);
  });

  it('should handle generator migrations', function (done) {
    set.up(function (err) {
      assert.ifError(err);
      assert.deepEqual(db.tesla, ['1-energy', '2-energies', '3000-energies']);

      set.up(function (err) {
        assert.ifError(err);
        assert.deepEqual(db.tesla, ['1-energy', '2-energies', '3000-energies']);

        set.down(function (err) {
          assert.ifError(err);
          assert.deepEqual(db.tesla, []);

          set.down(function (err) {
            assert.ifError(err);
            assert.deepEqual(db.tesla, []);

            done();
          });
        });
      });
    });
  });

  it('should add a new generator migration', function (done) {
    var up = function* () {
      db.tesla.push('2 psycho-kinetic energies');
      db.tesla.push('3 psycho-kinetic energies');
    };

    var down = function* () {
      db.tesla.pop();
      db.tesla.pop();
    };

    set.addMigration('ghosts', up, down);

    var expectedEnergies = ['1-energy', '2-energies', '3000-energies', '2 psycho-kinetic energies', '3 psycho-kinetic energies'];

    set.up(function (err) {
      assert.ifError(err);
      assert.deepEqual(db.tesla, expectedEnergies);

      set.up(function (err) {
        assert.ifError(err);
        assert.deepEqual(db.tesla, expectedEnergies);

        set.down(function (err) {
          assert.ifError(err);
          assert.deepEqual(db.tesla, []);

          set.down(function (err) {
            assert.ifError(err);
            assert.deepEqual(db.tesla, []);

            done();
          });
        });
      });
    });
  });

  it('should catch errors in migration "up" generators', function (done) {
    var up = function* () {
      throw new Error("i ain't afraid of no ghost");
    };

    var down = function* () {
      // empty
    };

    set.addMigration('ghostbusters', up, down);

    set.up(function (err) {
      assert.ok(err);
      assert.equal(err.message, "i ain't afraid of no ghost");

      done();
    });
  });

  it('should catch errors in migration "down" generators', function (done) {
    var up = function* () {
      // empty
    };

    var down = function* () {
      yield new Promise(function (resolve, reject) {
        reject(new Error("cats & dogs, living together"));
      });
    };

    set.addMigration('mass hysteria', up, down);

    set.up(function (err) {
      assert.ifError(err);

      set.down(function (err) {
        assert.ok(err);
        assert.equal(err.message, "cats & dogs, living together");

        done();
      })
    });
  });

  afterEach(function (done) {
    db.nuke();
    fs.unlink(STATE, done);
  });

});
