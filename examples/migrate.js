
// bad example, but you get the point ;)

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

var set = migrate();

console.log();
set.on('save', function(){
  console.log();
});

set.on('migration', function(migration, direction){
  console.log('  \033[90m%s\033[0m \033[36m%s\033[0m', direction, migration.title);
});

set.up(function(err){
  if (err) throw err;
  process.exit();
});
