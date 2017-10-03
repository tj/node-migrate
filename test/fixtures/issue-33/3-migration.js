'use strict'

const db = require('../../util/db')

exports.up = function () {
  db.issue33.push('3-up')
  return Promise.resolve()
}

exports.down = function () {
  db.issue33.push('3-down')
  return Promise.resolve()
}
