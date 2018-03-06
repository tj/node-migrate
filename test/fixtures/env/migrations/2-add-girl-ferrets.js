var db = require('../../../util/db')

exports.up = function () {
  db[process.env.DB].push({ name: 'jane' })
  db.persist()
}

exports.down = function () {
  db[process.env.DB].pop()
  db.persist()
}
