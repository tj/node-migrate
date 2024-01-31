// bad example, but you get the point ;)

// $ npm install redis
// $ redis-server

const redis = require('redis')
const db = redis.createClient()

module.exports = db
