
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var migrate = require('../');
var db = require('./fixtures/db');

var BASE = path.join(__dirname, 'fixtures', 'promises');
var STATE = path.join(BASE, '.migrate');

describe('migrate (...Async functions)', function () {

  var set;

  beforeEach(function () {
    set = migrate.load(STATE, BASE);
  });

  it('should handle migrations that return promises', function (done) {
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

  it('should add a promise based migration', function (done) {
    var up = function () {
      return new Promise(function (resolve) {
        db.tesla.push('2 psycho-kinetic energies');
        db.tesla.push('3 psycho-kinetic energies');

        resolve();
      });
    };

    var down = function () {
      db.tesla.pop();
      db.tesla.pop();

      return Promise.resolve();
    };

    set.addAsyncMigration('ghosts', up, down);

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

  it('should catch errors in promise based "up" functions', function (done) {
    var up = function () {
      return Promise.reject(new Error("i ain't afraid of no ghost"));
    };

    var down = function (next) {
      next();
    };

    set.addAsyncMigration('ghostbusters', up, down);

    set.up(function (err) {
      assert.ok(err);
      assert.equal(err.message, "i ain't afraid of no ghost");

      done();
    });
  });

  it('should catch errors in promise based "down" functions', function (done) {
    var up = function () {
      // empty
    };

    var down = function () {
      return new Promise(function (resolve, reject) {
        reject(new Error("cats & dogs, living together"));
      });
    };

    set.addAsyncMigration('mass hysteria', up, down);

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
