'use strict'

const db = require('../../../util/db')

exports.up = async function () {
  db.load()
  db.numbers.push('2-up')
  db.persist()
}

exports.down = async function () {
  db.load()
  let index = db.numbers.indexOf('2-up')
  db.numbers.splice(index, 1)
  db.persist()
}
