'use strict';

// use `migrate create add-pets --template-file migrations/template.js`

var db = require('./db');

exports.up = function(next){
  next();
};

exports.down = function(next){
  next();
};
