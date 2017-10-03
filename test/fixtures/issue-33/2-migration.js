'use strict'

const db = require('../../util/db')

exports.up = function () {
  db.issue33.push('2-up')
  return Promise.resolve()
}

exports.down = function () {
  db.issue33.push('2-down')
  return Promise.resolve()
}
