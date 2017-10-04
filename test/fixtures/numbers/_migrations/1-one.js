'use strict'

const db = require('../../../util/db')

exports.up = async function () {
  db.load()
  db.numbers.push('1-up')
  db.persist()
}

exports.down = async function () {
  db.load()
  let index = db.numbers.indexOf('1-up')
  db.numbers.splice(index, 1)
  db.persist()
}
