
// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server

var redis = require('redis')
  , db = redis.createClient();

module.exports = db;