
var db = require('./db')

exports.up = async function () {
  return Promise.all([
    db.rpushAsync('pets', 'tobi'),
    db.rpushAsync('pets', 'loki')
  ])
}

exports.down = async function () {
  return Promise.all([
    db.rpop('pets'),
    db.rpop('pets')
  ])
}
