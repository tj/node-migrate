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
      let store = {}
      try {
        store = JSON.parse(rows[0].data)   // Parse the single row into a migration data object
      } catch (e) {
        console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
      }

      fn(null, store)    // Call callback with new migration data object
    })
  }

  static save (set, fn) {
    const migrationData = JSON.stringify({         // Take the data stored in 'set', map it to a simple object and stringify it.
      lastRun: set.lastRun,
      migrations: set.migrations
    })

    return pool.query('CREATE TABLE IF NOT EXISTS schema.migrations (data text NOT NULL)').then(() => {   // Check if table 'migrations' exists and if not, create it.
      pool.query('DELETE FROM schema.migrations').then(() => {                                            // Clean the table of all data
        pool.query('INSERT INTO schema.migrations (data) VALUES ($1)', [migrationData]).then(() => {      // Insert one row with the new migration data.
          fn()                                                                                            // Call callback
        })
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
