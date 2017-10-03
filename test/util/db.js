'use strict'

const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

const DB_PATH = path.join(__dirname, 'test.json')

exports.pets = []
exports.issue33 = []
exports.numbers = []

function nuke () {
  exports.pets = []
  exports.issue33 = []
  exports.numbers = []

  rimraf.sync(DB_PATH)
}

function load () {
  let c

  try {
    c = fs.readFileSync(DB_PATH, 'utf8')
  } catch (e) {
    // console.error('Error loading ' + DB_PATH, e)
    return
  }

  let j

  try {
    j = JSON.parse(c)
  } catch (e) {
    // console.error('Error parsing ' + c, e)
    return
  }

  Object.keys(j).forEach(function (k) {
    exports[k] = j[k]
  })
}

function persist () {
  fs.writeFileSync(DB_PATH, JSON.stringify(exports))
}

exports.nuke = nuke
exports.persist = persist
exports.load = load
