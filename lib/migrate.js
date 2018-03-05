'use strict'
module.exports = migrate

async function migrate (set, direction, config, migrationName) {
  var migrations
  var lastRunIndex
  var toIndex
  if (!migrationName) {
    toIndex = direction === 'up' ? set.migrations.length : 0
  } else if ((toIndex = positionOfMigration(set.migrations, migrationName)) === -1) {
    throw new Error('Could not find migration: ' + migrationName)
  }

  lastRunIndex = positionOfMigration(set.migrations, set.lastRun)
  migrations = (direction === 'up' ? upMigrations : downMigrations)(set, lastRunIndex, toIndex)
  for (let migration of migrations) {
    if (typeof migration[direction] !== 'function') {
      throw new TypeError('Migration ' + migration.title + ' does not have method ' + direction)
    }
    set.emit('migration', migration, direction)
    await migration[direction](config)
    migration.timestamp = direction === 'up' ? Date.now() : null
    lastRunIndex--
    if (direction === 'up') {
      set.lastRun = migration.title
    } else {
      set.lastRun = set.migrations[lastRunIndex] ? set.migrations[lastRunIndex].title : null
    }
    await set.save()
  }
}

function upMigrations (set, lastRunIndex, toIndex) {
  return set.migrations.reduce(function (arr, migration, index) {
    if (index > toIndex) {
      return arr
    }

    if (index < lastRunIndex && !migration.timestamp) {
      set.emit('warning', 'migrations running out of order')
    }

    if (!migration.timestamp) {
      arr.push(migration)
    }

    return arr
  }, [])
}

function downMigrations (set, lastRunIndex, toIndex) {
  return set.migrations.reduce(function (arr, migration, index) {
    if (index < toIndex || index > lastRunIndex) {
      return arr
    }

    if (migration.timestamp) {
      arr.push(migration)
    }

    return arr
  }, []).reverse()
}

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */

function positionOfMigration (migrations, title) {
  for (var i = 0; i < migrations.length; ++i) {
    if (migrations[i].title === title) return i
  }
  return -1
}
