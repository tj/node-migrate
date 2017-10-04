'use strict'

const db = require('../../util/db')

exports.up = function () {
  db.pets.push({ name: 'jane' })
  return Promise.resolve()
}

exports.down = function () {
  db.pets.pop()
  return Promise.resolve()
}
