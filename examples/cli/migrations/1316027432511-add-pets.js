
var db = require('./db');

exports.up = function(next){
  db.rpush('pets', 'tobi');
  db.rpush('pets', 'loki', next);
};

exports.down = function(next){
  db.rpop('pets');
  db.rpop('pets', next);
};
