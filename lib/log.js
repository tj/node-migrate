'use strict'
var chalk = require('chalk')

module.exports = function log (key, msg) {
  console.log('  ' + chalk.grey(key) + ' : ' + chalk.cyan(msg))
}

module.exports.error = function log (key, msg) {
  console.error('  ' + chalk.red(key) + ' : ' + chalk.white(msg))
  if (msg instanceof Error) {
    console.error(msg)
  }
}
