// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server

const path = require('path')
const migrate = require('../')
const redis = require('redis')
const db = redis.createClient()

migrate(path.join(__dirname, '.migrate'))

migrate('add pets', function (next) {
  db.rpush('pets', 'tobi')
  db.rpush('pets', 'loki', next)
}, function (next) {
  db.rpop('pets')
  db.rpop('pets', next)
})

migrate('add jane', function (next) {
  db.rpush('pets', 'jane', next)
}, function (next) {
  db.rpop('pets', next)
})

migrate('add owners', function (next) {
  db.rpush('owners', 'taylor')
  db.rpush('owners', 'tj', next)
}, function (next) {
  db.rpop('owners')
  db.rpop('owners', next)
})

migrate('coolest pet', function (next) {
  db.set('pets:coolest', 'tobi', next)
}, function (next) {
  db.del('pets:coolest', next)
})

const set = migrate()

console.log()
set.on('save', function () {
  console.log()
})

set.on('migration', function (migration, direction) {
  console.log(direction, migration.title)
})

set.up(function (err) {
  if (err) throw err
  process.exit()
})
