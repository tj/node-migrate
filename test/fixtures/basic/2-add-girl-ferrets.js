
var db = require('../../util/db')

exports.up = async function () {
  db.pets.push({ name: 'jane' })
}

exports.down = async function () {
  db.pets.pop()
}
