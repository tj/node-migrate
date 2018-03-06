'use strict'
var path = require('path')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var slug = require('slug')
var formatDate = require('dateformat')
var mkdirp = require('mkdirp-promise')

module.exports = async function templateGenerator (opts, cb) {
  // Setup default options
  opts = opts || {}
  var name = opts.name
  var dateFormat = opts.dateFormat
  var templateFile = opts.templateFile || path.join(__dirname, 'template.js')
  var migrationsDirectory = opts.migrationsDirectory || 'migrations'
  var extention = opts.extention || '.js'

  let template = await loadTemplate(templateFile)
    // Ensure migrations directory exists
  await mkdirp(migrationsDirectory)

  // Create date string
  var formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now()

  // Fix up file path
  var p = path.join(
      process.cwd(),
      migrationsDirectory,
      slug(formattedDate + (name ? '-' + name : '')) + extention)

  // Write the template file
  await fs.writeFileAsync(p, template)
  return p
}

var _templateCache = {}
async function loadTemplate (tmpl) {
  if (_templateCache[tmpl]) {
    return _templateCache
  }
  let content = await fs.readFileAsync(tmpl, {
    encoding: 'utf8'
  })
  _templateCache[tmpl] = content
  return content
}
