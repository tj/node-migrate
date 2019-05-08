'use strict'

var customRequire = require('./custom-require')

module.exports = registerCompiler

function registerCompiler (c) {
  var compiler = c.split(':')
  var ext = compiler[0]
  var mod = compiler[1]

  customRequire(mod)({
    extensions: ['.' + ext]
  })
}
