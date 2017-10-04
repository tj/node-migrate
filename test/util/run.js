'use strict'

const path = require('path')
const spawn = require('child_process').spawn

const UP = path.join(__dirname, '..', '..', 'bin', 'migrate-up')
const DOWN = path.join(__dirname, '..', '..', 'bin', 'migrate-down')
const CREATE = path.join(__dirname, '..', '..', 'bin', 'migrate-create')
const INIT = path.join(__dirname, '..', '..', 'bin', 'migrate-init')
const LIST = path.join(__dirname, '..', '..', 'bin', 'migrate-list')

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

      return resolve(stdout)
    })
  })
}

// Run specific commands
module.exports.up = (dir, args) => run.bind(null, UP, dir)(args)
module.exports.down = (dir, args) => run.bind(null, DOWN, dir)(args)
module.exports.create = (dir, args) => run.bind(null, CREATE, dir)(args)
module.exports.init = (dir, args) => run.bind(null, INIT, dir)(args)
module.exports.list = (dir, args) => run.bind(null, LIST, dir)(args)
