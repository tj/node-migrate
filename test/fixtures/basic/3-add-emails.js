
var db = require('../db');

exports.up = function (next) {
  db.pets.forEach(function (pet) {
    pet.email = pet.name + '@learnboost.com';
  });
  next();
};

exports.down = function (next) {
  db.pets.forEach(function (pet) {
    delete pet.email;
  });
  next();
};
