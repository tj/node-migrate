'use strict'

const path = require('path')
const spawn = require('child_process').spawn

const run = module.exports = function run (cmd, dir, args, done) {
  return new Promise(function (resolve, reject) {
    const p = spawn('node', [cmd, '-c', dir, ...args], {shell: true})
    let stdout = ''
    let stderr = ''
    p.stdout.on('data', function (d) {
      stdout += d.toString('utf8')
    })
    p.stderr.on('data', function (d) {
      stderr += d.toString('utf8')
    })
    p.on('error', reject)
    p.on('close', function (code) {
      if (code !== 0) {
        return reject(new Error(stderr))
      }

      return resolve({stdout, code})
    })
  })
}

// Run specific commands
module.exports.up = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-up'))
module.exports.down = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-down'))
module.exports.create = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-create'))
module.exports.init = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-init'))
module.exports.list = run.bind(null, path.join(__dirname, '..', '..', 'bin', 'migrate-list'))
