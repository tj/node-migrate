'use strict'

var path = require('path')

module.exports = function customRequire (mod) {
  try {
    return require(mod)
  } catch (e) {
    return require(path.resolve(mod))
  }
}
