'use strict'

module.exports.up = function (next) {
  setTimeout(function () {
    return next()
  }, 200)
}

module.exports.down = function (next) {
  setTimeout(function () {
    return next()
  }, 200)
}
