'use strict'

module.exports.up = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('foo')
    }, 1)
  })
}

module.exports.down = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('foo')
    }, 1)
  })
}
