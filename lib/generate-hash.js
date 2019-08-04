'use strict'

var fs = require('fs')
var crypto = require('crypto')

module.exports = generateHash

function checksum(str, algorithm, encoding) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }

function generateHash(filename, algorithm) {
  if (algorithm) {
    algorithm = 'sha1'
  }
  var hash = null
  fs.readFile(filename, function(err, data) {
    if (err) {
        return hash
    }
    hash = checksum(data, algorithm)
  })

  return hash
} 