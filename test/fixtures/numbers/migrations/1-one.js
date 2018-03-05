var assert = require('assert')
var db = require('../../../util/db')

exports.up = async function () {
  db.load()
  db.numbers.push(1)
  db.persist()
}

exports.down = async function () {
  db.load()
  db.numbers.pop()
  db.persist()
}

exports.test = async function () {
  await exports.up()
  exports.verify()
  return exports.down()
}

exports.verify = function () {
  assert.equal(db.numbers.indexOf(1), 0)
}
