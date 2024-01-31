const db = require('../../util/db')

exports.up = function (next) {
  db.issue33.push('1-up')
  next()
}

exports.down = function (next) {
  db.issue33.push('1-down')
  next()
}
