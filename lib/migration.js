'use strict'

/*!
 * migrate - Migration
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `Migration`.
 */

class Migration {
  constructor (title, up, down, description) {
    this.title = title
    this.up = up
    this.down = down
    this.description = description
    this.timestamp = null
  }
}

module.exports = Migration
