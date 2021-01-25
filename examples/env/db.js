'use strict'
const fs = require('fs')

module.exports = {
  loaded: false,
  tables: {},
  table: function (name) {
    this.tables[name] = []
    this.save()
  },
  removeTable: function (name) {
    delete this.tables[name]
    this.save()
  },
  insert: function (table, value) {
    this.tables[table].push(value)
    this.save()
  },
  remove: function (table, value) {
    this.tables[table].splice(this.tables[table].indexOf(value), 1)
    this.save()
  },
  save: function () {
    fs.writeFileSync('.db', JSON.stringify(this))
  },
  load: function () {
    if (this.loaded) return this
    let json
    try {
      json = JSON.parse(fs.readFileSync('.db', 'utf8'))
    } catch (e) {
      // ignore
      return this
    }
    this.loaded = true
    this.tables = json.tables
    return this
  },
  toJSON: function () {
    return {
      tables: this.tables
    }
  }
}
