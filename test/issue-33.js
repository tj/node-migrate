
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var migrate = require('../');
var db = require('./fixtures/db');

var BASE = path.join(__dirname, 'fixtures', 'issue-33');
var STATE = path.join(BASE, '.migrate');

var A1 = ['1-up', '2-up', '3-up'];
var A2 = A1.concat(['3-down', '2-down', '1-down']);

describe('issue #33', function () {

  var set;

  beforeEach(function () {
    set = migrate.load(STATE, BASE);
  });

  it('should run migrations in the correct order', function (done) {

    set.up(function (err) {
      assert.ifError(err);
      assert.deepEqual(db.issue33, A1);

      set.up(function (err) {
        assert.ifError(err);
        assert.deepEqual(db.issue33, A1);

        set.down(function (err) {
          assert.ifError(err);
          assert.deepEqual(db.issue33, A2);

          set.down(function (err) {
            assert.ifError(err);
            assert.deepEqual(db.issue33, A2);

            done();
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
