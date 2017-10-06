'use strict'

module.exports = migrate

function migrate (set, direction, migrationName, fn) {
  var migrations = []
  var lastRunIndex
  var toIndex

  if (!migrationName) {
    toIndex = direction === 'up' ? set.migrations.length : 0
  } else if ((toIndex = positionOfMigration(set.migrations, migrationName)) === -1) {
    return fn(new Error('Could not find migration: ' + migrationName))
  }

  lastRunIndex = positionOfMigration(set.migrations, set.lastRun)
  migrations = (direction === 'up' ? upMigrations : downMigrations)(set, lastRunIndex, toIndex)

  function next (migration) {
    // Done running migrations
    if (!migration) return fn(null)

    // Missing direction method
    if (typeof migration[direction] !== 'function') {
      return fn(new TypeError('Migration ' + migration.title + ' does not have method ' + direction))
    }

    // Status for supporting promises and callbacks
    var isPromise = false

    // Run the migration function
    set.emit('migration', migration, direction)
    var returnValue = migration[direction](function (err) {
      if (isPromise) return set.emit('warning', 'if your migration returns a promise, do not call the done callback')
      completeMigration(err)
    })

    // Is it a promise?
    isPromise = typeof Promise !== 'undefined' && returnValue instanceof Promise

    // Handle the promises
    if (isPromise) {
      returnValue
        .then(completeMigration)
        .catch(completeMigration)
    }

    function completeMigration (err) {
      if (err) return fn(err)

      // Set timestamp if running up, clear it if down
      migration.timestamp = direction === 'up' ? Date.now() : null

      // Decrement last run index
      lastRunIndex--

      set.lastRun = direction === 'up' ? migration.title : set.migrations[lastRunIndex] && set.migrations[lastRunIndex].title
      set.save(function (err) {
        if (err) return fn(err)

        next(migrations.shift())
      })
    }
  }

  next(migrations.shift())
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
