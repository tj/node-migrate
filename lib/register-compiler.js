'use strict'
const path = require('path')

module.exports = registerCompiler

function registerCompiler (c) {
  const compiler = c.split(':')
  const ext = compiler[0]
  let mod = compiler[1]

  if (mod[0] === '.') mod = path.join(process.cwd(), mod)
  require(mod)({
    extensions: ['.' + ext]
  })
}
