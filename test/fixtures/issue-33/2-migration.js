'use strict'

const db = require('../../util/db')

exports.up = async function () {
  db.issue33.push('2-up')
}

exports.down = async function () {
  db.issue33.push('2-down')
}
