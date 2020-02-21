'use strict'
var path = require('path')
var log = require('./log')
var deprecate = require('depd')('migrate')

module.exports = registerCompiler

function registerCompiler (c, r) {
  if (c && r) {
    log('warning', 'Both --require and --compiler options specified. Using --require')
    return
  }

  if (c) {
    deprecate('--compiler is deprecated consider using --require instead')
    var compiler = c.split(':')
    var ext = compiler[0]
    var mod = compiler[1]

    if (mod[0] === '.') mod = path.join(process.cwd(), mod)
    require(mod)({
      extensions: ['.' + ext]
    })
  }
}
