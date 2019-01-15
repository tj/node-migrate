'use strict'
var path = require('path')

module.exports = registerCompiler

function registerCompiler (c) {
  var compiler = c.split(':')
  var ext = compiler[0]
  var mod = compiler[1]

  if (mod[0] === '.') mod = path.join(process.cwd(), mod)
  require(mod)({
    extensions: ['.' + ext]
  })
}
