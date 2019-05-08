'use strict'

var customRequire = require('./custom-require')

module.exports = registerCompiler

function registerCompiler (c) {
  var compiler = c.split(':')

  if (compiler.length === 1) {
    customRequire(compiler[0])
  } else if (compiler.length === 2) {
    var extensions = compiler[0].split(',')
    var moduleName = compiler[1]

    customRequire(moduleName)({
      extensions: extensions.map(function (ext) {
        return '.' + ext
      })
    })
  } else {
    throw new Error('Invalid compiler format')
  }
}
