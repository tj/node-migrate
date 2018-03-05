
var db = require('./db')

exports.up = async function () {
  await db.set('pets:coolest', 'tobi')
}

exports.down = async function () {
  await db.del('pets:coolest')
}
