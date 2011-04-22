
var db = require('./db');

exports.up = function(next){
  db.set('pets:coolest', 'tobi', next);
};

exports.down = function(next){
  db.del('pets:coolest', next);
};
