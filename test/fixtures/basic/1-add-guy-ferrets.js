'use strict'

const db = require('../../util/db')

exports.description = 'Adds two pets'

exports.up = function () {
  db.pets.push({ name: 'tobi' })
  db.pets.push({ name: 'loki' })
  return Promise.resolve()
}

exports.down = function () {
  db.pets.pop()
  db.pets.pop()
  return Promise.resolve()
}
