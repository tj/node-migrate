'use strict'

module.exports.up = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      return resolve()
    }, 200)
  })
}

module.exports.down = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      return resolve()
    }, 200)
  })
}
