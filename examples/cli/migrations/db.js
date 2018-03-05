
// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server
var Promise = require('bluebird')
var redis = require('redis')
Promise.promisifyAll(redis.RedisClient.prototype)
var db = redis.createClient()

module.exports = db
