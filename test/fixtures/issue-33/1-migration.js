'use strict'

const db = require('../../util/db')

exports.up = async function () {
  db.issue33.push('1-up')
}

exports.down = async function () {
  db.issue33.push('1-down')
}
