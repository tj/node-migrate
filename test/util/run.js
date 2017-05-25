'use strict'
const spawn = require('child_process').spawn

module.exports = function run (cmd, dir, args, done) {
  var p = spawn(cmd, ['-c', dir, ...args])
  var out = ''
  p.stdout.on('data', function (d) {
    out += d.toString('utf8')
  })
  p.stderr.on('data', function (d) {
    out += d.toString('utf8')
  })
  p.on('error', done)
  p.on('close', function (code) {
    if (code !== 0) {
      console.error(out)
    }
    done(null, out, code)
  })
}
