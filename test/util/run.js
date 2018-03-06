'use strict'
const path = require('path')
const spawn = require('child_process').spawn

var run = module.exports = async function run (cmd, dir, args, done) {
  return new Promise((resolve, reject) => {
    var p = spawn(cmd, ['-c', dir, ...args])
    var out = ''
    p.stdout.on('data', function (d) {
      out += d.toString('utf8')
    })
    p.stderr.on('data', function (d) {
      out += d.toString('utf8')
    })
    p.on('error', reject)
    p.on('close', function (code) {
      resolve({out: out, code: code})
    })
  })
}

// Run specific commands
module.exports.up = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-up'))
module.exports.down = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-down'))
module.exports.create = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-create'))
module.exports.init = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-init'))
module.exports.list = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-list'))
