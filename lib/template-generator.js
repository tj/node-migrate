'use strict'

const path = require('path')
const fs = require('fs')
const util = require('util')
const slug = require('slug')
const formatDate = require('dateformat')
const mkdirp = require('mkdirp')

const pReadFile = util.promisify(fs.readFile)
const pWriteFile = util.promisify(fs.writeFile)
const pMkdirp = util.promisify(mkdirp)

module.exports = async function templateGenerator (opts) {
  // Setup default options
  opts = opts || {}
  const name = opts.name
  const dateFormat = opts.dateFormat
  const templateFile = opts.templateFile || path.join(__dirname, 'template.js')
  const migrationsDirectory = opts.migrationsDirectory || 'migrations'
  const extention = opts.extention || '.js'

  const template = await loadTemplate(templateFile)

  // Ensure migrations directory exists
  await pMkdirp(migrationsDirectory)

  // Create date string
  const formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now()

 // Fix up file path
  const p = path.join(process.cwd(), migrationsDirectory, slug(formattedDate + (name ? '-' + name : '')) + extention)

  // Write the template file
  await pWriteFile(p, template)

  return p
}

const _templateCache = {}
function loadTemplate (tmpl) {
  if (_templateCache[tmpl]) {
    return Promise.resolve(_templateCache)
  }

  return pReadFile(tmpl, {encoding: 'utf8'})
    .then(content => {
      _templateCache[tmpl] = content
      return content
    })
}
