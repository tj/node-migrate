
var db = require('./db')

exports.up = async function () {
  await db.rpushAsync('pets', 'jane')
}

exports.down = async function () {
  await db.rpopAsync('pets')
}
