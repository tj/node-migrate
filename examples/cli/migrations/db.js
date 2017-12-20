
// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server

var redis = require('redis')
var db = redis.createClient()

module.exports = db
