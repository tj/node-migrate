
var db = require('../../util/db')

exports.up = async function () {
  db.pets.forEach(function (pet) {
    pet.email = pet.name + '@learnboost.com'
  })
}

exports.down = async function () {
  db.pets.forEach(function (pet) {
    delete pet.email
  })
}
