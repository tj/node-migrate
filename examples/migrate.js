
// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server

var path = require('path')
var Promise = require('bluebird')
var migrate = require('../')
var redis = require('redis')
Promise.promisifyAll(redis.RedisClient.prototype)
var db = redis.createClient()

migrate(path.join(__dirname, '.migrate'))

migrate('add pets', async function () {
  return Promise.all([
    db.rpushAsync('pets', 'tobi'),
    db.rpushAsync('pets', 'loki')
  ])
}, async function () {
  return Promise.all([
    db.rpopAsync('pets'),
    db.rpopAsync('pets')
  ])
})

migrate('add jane', async function () {
  return db.rpushAsync('pets', 'jane')
}, async function () {
  return db.rpopAsync('pets')
})

migrate('add owners', async function () {
  return Promise.all([
    db.rpushAsync('owners', 'taylor'),
    db.rpushAsync('owners', 'tj')
  ])
}, async function () {
  return Promise.all([
    db.rpopAsync('owners'),
    db.rpopAsync('owners')
  ])
})

migrate('coolest pet', async function () {
  return db.setAsync('pets:coolest', 'tobi')
}, async function () {
  return db.delAsync('pets:coolest')
})

var set = migrate()

console.log()
set.on('save', function () {
  console.log()
})

set.on('migration', function (migration, direction) {
  console.log(direction, migration.title)
})

async function main () {
  await set.up()
  process.exit()
}

main()
