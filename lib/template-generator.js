'use strict'
const path = require('path')
const fs = require('fs').promises
const slug = require('slug')
const formatDate = require('dateformat')
const mkdirp = require('mkdirp')

module.exports = async function templateGenerator (opts, cb) {
  try {
    // Setup default options
    opts = opts || {}
    const name = opts.name
    const dateFormat = opts.dateFormat
    const templateFile = opts.templateFile || path.join(__dirname, 'template.js')
    const migrationsDirectory = opts.migrationsDirectory || 'migrations'
    const extension = opts.extension

    const template = await loadTemplate(templateFile)
    // Ensure migrations directory exists
    await mkdirp(migrationsDirectory)
    // Create date string
    const formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now()

    // Fix up file path
    const p = path.join(path.resolve(migrationsDirectory), slug(formattedDate + (name ? '-' + name : '')) + extension)

    // Write the template file
    await fs.writeFile(p, template)
    cb(null, p)
  } catch (e) {
    cb(e)
  }
}

const _templateCache = {}

async function loadTemplate (tmpl) {
  if (_templateCache[tmpl]) {
    return _templateCache[tmpl]
  }
  const content = await fs.readFile(tmpl, { encoding: 'utf8' })

  _templateCache[tmpl] = content
  return content
}
