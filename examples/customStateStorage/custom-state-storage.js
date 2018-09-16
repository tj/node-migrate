const {Pool} = require('pg') // Postgres driver
const pool = new Pool() // Query pool
const migrate = require('migrate')

/**
 * Simple class that stores and loads the executed migrations in the database. The table
 * migrations is only one row and stores a JSON of the data that the migrate package uses to know which
 * migrations have been executed.
 */
class customStateStorage {
  static load (fn) {
    return pool.query('SELECT data FROM schema.migrations').then(({rows}) => {  // Load the single row of migration data from the database
      if (rows.length !== 1) {
        console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
        return fn(null, {})
      }

      return fn(null, rows[0].data)    // Call callback with new migration data object
    })
  }

  static save (set, fn) {
    const migrationData = {         // Take the data stored in 'set' and map it to a simple object.
      lastRun: set.lastRun,
      migrations: set.migrations
    }

    return pool.query('CREATE TABLE IF NOT EXISTS schema.migrations (data jsonb NOT NULL UNIQUE)').then(() => {   // Check if table 'migrations' exists and if not, create it.
      pool.query('INSERT INTO schema.migrations (data) VALUES ($1) ON CONFLICT (data) DO UPDATE SET data = $1', [migrationData]).then(() => { // Upsert the migration data
        fn()                                                                                            // Call callback
      })
    })
  }
}

/**
 * Main application code
 */
migrate.load({
  stateStore: customStateStorage // Set class as custom stateStore
}, function (err, set) {
  if (err) {
    throw err
  }

  set.up((er) => {
    if (er) {
      throw er
    }

    console.log('Migrations successfully ran')
  })
})
