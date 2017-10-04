'use strict'

const flat = require('node-flat-db')
const storage = require('node-flat-db/file-async')

const db = flat('db.json', { storage })

module.exports = db
