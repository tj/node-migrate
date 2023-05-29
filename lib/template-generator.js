'use strict'
const path = require('path')
const fs = require('fs')
const slug = require('slug')
const formatDate = require('dateformat')
const { mkdirp } = require('mkdirp')

module.exports = function templateGenerator (opts, cb) {
  // Setup default options
  opts = opts || {}
  const name = opts.name
  const dateFormat = opts.dateFormat
  const templateFile = opts.templateFile || path.join(__dirname, 'template.js')
  const migrationsDirectory = opts.migrationsDirectory || 'migrations'
  const extension = opts.extension

  loadTemplate(templateFile, function (err, template) {
    if (err) return cb(err)

    // Ensure migrations directory exists
    mkdirp(migrationsDirectory).then(function () {
      // Create date string
      const formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now()

      // Fix up file path
      const p = path.join(path.resolve(migrationsDirectory), slug(formattedDate + (name ? '-' + name : '')) + extension)

      // Write the template file
      fs.writeFile(p, template, function (err) {
        if (err) return cb(err)
        cb(null, p)
      })
    }).catch(cb)
  })
}

const _templateCache = {}
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
