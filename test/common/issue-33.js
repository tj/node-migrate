
var assert = require('assert');

var migrate = require('../..');
var db = require('./fixtures/db');

var A1 = ['1-up', '2-up', '3-up'];
var A2 = A1.concat(['3-down', '2-down', '1-down']);

module.exports = function(BASE, storeUnderTest) {
  return function () {
    var set;
    var store;

    beforeEach(function () {
      store = new (Function.prototype.bind.apply(storeUnderTest.Store, [null].concat(storeUnderTest.args)));
      set = migrate.load(store, BASE);
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
      store.reset(done);
    });

  }
};
