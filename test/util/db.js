var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')

var DB_PATH = path.join(__dirname, 'test.db')

function init () {
  exports.pets = []
  exports.issue33 = []
  exports.numbers = []
}

function nuke () {
  init()
  rimraf.sync(DB_PATH)
}

function load () {
  try {
    var c = fs.readFileSync(DB_PATH, 'utf8')
  } catch (e) {
    return
  }
  var j = JSON.parse(c)
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

init()
