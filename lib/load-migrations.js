'use strict'

var path = require('path')
var fs = require('fs')
var Migration = require('./migration')

module.exports = loadMigrationsIntoSet

function loadMigrationsIntoSet (set, migrationsDirectory, filter, sort) {
  var dir = path.resolve(migrationsDirectory)
  var files = fs.readdirSync(dir)

  // Run filter
  files = files.filter(filter || (() => true))

  // Run sort
  files = files.sort(sort)

  // Load the migrations into the set
  files.forEach(function (file) {
    var mod = require(path.join(dir, file))
    var migration = new Migration(file, mod.up, mod.down, mod.description)
    set.addMigration(migration)
  })
}
