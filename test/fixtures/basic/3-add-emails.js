'use strict'

const db = require('../../util/db')

exports.up = function () {
  db.pets.forEach(function (pet) {
    pet.email = pet.name + '@learnboost.com'
  })
  return Promise.resolve()
}

exports.down = function () {
  db.pets.forEach(function (pet) {
    delete pet.email
  })
  return Promise.resolve()
}
