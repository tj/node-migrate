'use strict'

module.exports = migrate

function migrate (set, direction, migrationName, fn) {
  var migrations
  var migrationPos

  if (!migrationName) {
    migrationPos = direction === 'up' ? set.migrations.length : 0
  } else if ((migrationPos = positionOfMigration(set.migrations, migrationName)) === -1) {
    return fn(new Error('Could not find migration: ' + migrationName))
  }

  switch (direction) {
    case 'up':
      migrations = set.migrations.slice(set.pos, migrationPos + 1)
      break
    case 'down':
      migrations = set.migrations.slice(migrationPos, set.pos).reverse()
      break
  }

  function next (migration) {
    if (!migration) return fn(null)

    set.emit('migration', migration, direction)
    migration[direction](function (err) {
      if (err) return fn(err)

      set.pos += (direction === 'up' ? 1 : -1)
      set.save(function (err) {
        if (err) return fn(err)

        next(migrations.shift())
      })
    })
  }

  next(migrations.shift())
}

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */

function positionOfMigration (migrations, filename) {
  for (var i = 0; i < migrations.length; ++i) {
    if (migrations[i].title === filename) return i
  }
  return -1
}
