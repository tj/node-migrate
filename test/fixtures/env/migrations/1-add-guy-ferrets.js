var db = require('../../../util/db')

exports.up = function (next) {
  db[process.env.DB].push({ name: 'tobi' })
  db[process.env.DB].push({ name: 'loki' })
  db.persist()
  next()
}

exports.down = function (next) {
  db[process.env.DB].pop()
  db[process.env.DB].pop()
  db.persist()
  next()
}
