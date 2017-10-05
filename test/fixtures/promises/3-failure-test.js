'use strict'

module.exports.up = function (next) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      next()
      return resolve()
    }, 200)
  })
}

module.exports.down = function (next) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      next()
      return resolve()
    }, 200)
  })
}
