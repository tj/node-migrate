
var db = require('./db');

exports.up = function(next){
  db.rpush('owners', 'taylor');
  db.rpush('owners', 'tj', next);
};

exports.down = function(next){
  db.rpop('owners');
  db.rpop('owners', next);
};
