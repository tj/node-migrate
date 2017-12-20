var db = require('../../../util/db')

exports.up = function (next) {
  db.load()
  db.numbers.push(2)
  db.persist()
  next()
}

exports.down = function (next) {
  db.load()
  db.numbers.pop()
  db.persist()
  next()
}
