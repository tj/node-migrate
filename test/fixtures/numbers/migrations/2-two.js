var db = require('../../../util/db')

exports.up = async function () {
  db.load()
  db.numbers.push(2)
  db.persist()
}

exports.down = async function () {
  db.load()
  db.numbers.pop()
  db.persist()
}
