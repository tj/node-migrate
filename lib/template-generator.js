'use strict'
var path = require('path')
var fs = require('fs')
var slug = require('slug')
var moment = require('moment')
var mkdirp = require('mkdirp')

module.exports = function templateGenerator (opts, cb) {
  // Setup default options
  opts = opts || {}
  var name = opts.name
  var dateFormat = opts.dateFormat || 'X'
  var templateFile = opts.templateFile || path.join(__dirname, 'template.js')
  var migrationsDirectory = opts.migrationsDirectory || 'migrations'
  var extention = opts.extention || '.js'

  loadTemplate(templateFile, function (err, template) {
    if (err) return cb(err)

    // Ensure migrations directory exists
    mkdirp(migrationsDirectory, function (err) {
      if (err) return cb(err)

      // Create date string
      var now = moment().format(dateFormat)

      // Fix up file path
      var p = path.join(process.cwd(), migrationsDirectory, slug(now + (name ? '-' + name : '')) + extention)

      // Write the template file
      fs.writeFile(p, template, function (err) {
        if (err) return cb(err)
        cb(null, p)
      })
    })
  })
}

var _templateCache = {}
function loadTemplate (tmpl, cb) {
  if (_templateCache[tmpl]) {
    return cb(null, _templateCache)
  }
  fs.readFile(tmpl, {
    encoding: 'utf8'
  }, function (err, content) {
    if (err) return cb(err)
    _templateCache[tmpl] = content
    cb(null, content)
  })
}
