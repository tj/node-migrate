const db = require('../../util/db')

exports.description = 'Adds two pets'

exports.up = function (next) {
  db.pets.push({ name: 'tobi' })
  db.pets.push({ name: 'loki' })
  next()
}

exports.down = function (next) {
  db.pets.pop()
  db.pets.pop()
  next()
}
