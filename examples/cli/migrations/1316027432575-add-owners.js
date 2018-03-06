
var db = require('./db')

exports.up = async function () {
  return Promise.all([
    db.rpushAsync('owners', 'taylor'),
    db.rpushAsync('owners', 'tj')
  ])
}

exports.down = async function () {
  return Promise.all([
    db.rpopAsync('owners'),
    db.rpopAsync('owners')
  ])
}
