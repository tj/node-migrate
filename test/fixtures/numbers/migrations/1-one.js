var assert = require('assert')
var db = require('../../../util/db')

exports.up = function (next) {
  db.load()
  db.numbers.push(1)
  db.persist()
  next()
}

exports.down = function (next) {
  db.load()
  db.numbers.pop()
  db.persist()
  next()
}

exports.test = function (next) {
  exports.up(function (err) {
    if (err) return next(err)
    exports.verify(function (err) {
      if (err) return next(err)
      exports.down(next)
    })
  })
}

exports.verify = function (next) {
  assert.equal(db.numbers.indexOf(1), 0)
  next()
}
