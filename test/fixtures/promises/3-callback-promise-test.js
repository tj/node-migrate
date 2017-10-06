'use strict'

module.exports.up = function (next) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      next()
      resolve()
    }, 1)
  })
}

module.exports.down = function (next) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      next()
      resolve()
    }, 1)
  })
}
