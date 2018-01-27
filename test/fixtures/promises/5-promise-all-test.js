'use strict'

module.exports.up = function () {
  return Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.reject(3)
  ])
}

module.exports.down = function () {
  return Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ])
}
