// bad example, but you get the point ;)

// $ npm install redis@3.0.0
// $ redis-server

const redis = require('redis')
const db = redis.createClient()

module.exports = db
