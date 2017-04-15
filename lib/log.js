'use strict'
var chalk = require('chalk')

module.exports = function log (key, msg) {
  console.log('  ' + chalk.grey(key) + ' : ' + chalk.cyan(msg))
}
