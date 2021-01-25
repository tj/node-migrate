const db = require('../../../util/db')

exports.up = function (next) {
  db[process.env.DB].push({ name: 'jane' })
  db.persist()
  next()
}

exports.down = function (next) {
  db[process.env.DB].pop()
  db.persist()
  next()
}
