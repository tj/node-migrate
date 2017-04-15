'use strict'
const spawn = require('child_process').spawn
const assert = require('assert')

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
      console.log(out)
    }
    assert.equal(code, 0)
    done(null, out)
  })
}
