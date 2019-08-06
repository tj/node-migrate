'use strict'

var fs = require('fs')
var crypto = require('crypto')

module.exports = generateHash

function checksum(str, algorithm, encoding) {
    return crypto
      .createHash(algorithm || 'sha1')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }

function generateHash(filename, algorithm) {
  if (algorithm) {
    algorithm = 'sha1'
  }
  var hash = null
  var data = fs.readFileSync(filename)
  hash = checksum(data, algorithm)
  return hash
}
