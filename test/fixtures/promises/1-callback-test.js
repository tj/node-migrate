'use strict'

module.exports.up = function (next) {
  setTimeout(function () {
    next()
  }, 1)
}

module.exports.down = function (next) {
  setTimeout(function () {
    next()
  }, 1)
}
