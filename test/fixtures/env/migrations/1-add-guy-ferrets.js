var db = require('../../../util/db')

exports.up = async function () {
  db[process.env.DB].push({ name: 'tobi' })
  db[process.env.DB].push({ name: 'loki' })
  db.persist()
}

exports.down = async function () {
  db[process.env.DB].pop()
  db[process.env.DB].pop()
  db.persist()
}
