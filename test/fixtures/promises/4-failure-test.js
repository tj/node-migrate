'use strict'

module.exports.up = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('foo'))
    }, 1)
  })
}

module.exports.down = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('foo'))
    }, 1)
  })
}
