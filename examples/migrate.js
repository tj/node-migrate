
// $ npm install redis
// $ redis-server

var migrate = require('../')
  , redis = require('redis')
  , db = redis.createClient();

migrate(__dirname + '/.migrate');

migrate('add pets', function(next){
  db.rpush('pets', 'tobi');
  db.rpush('pets', 'loki', next);
}, function(next){
  db.rpop('pets');
  db.rpop('pets', next);
});

migrate('add jane', function(next){
  db.rpush('pets', 'jane', next);
}, function(next){
  db.rpop('pets', next);
});

migrate('add owners', function(next){
  db.rpush('owners', 'taylor');
  db.rpush('owners', 'tj', next);
}, function(next){
  db.rpop('owners');
  db.rpop('owners', next);
});

migrate('coolest pet', function(next){
  db.set('pets:coolest', 'tobi', next);
}, function(next){
  db.del('pets:coolest', next);
});

migrate().up(function(err){
  if (err) throw err;
  console.log('done');
  process.exit();
});
