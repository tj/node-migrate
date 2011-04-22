
var db = require('./db');

exports.up = function(next){
  db.rpush('pets', 'jane', next);
};

exports.down = function(next){
  db.rpop('pets', next);
};
