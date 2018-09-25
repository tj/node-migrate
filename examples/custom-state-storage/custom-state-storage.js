'use strict'
const migrate = require('migrate')
const {Client} = require('pg')
const pg = new Client()

/**
 * Stores and loads the executed migrations in the database. The table
 * migrations is only one row and stores a JSON of the data that the
 * migrate package uses to know which migrations have been executed.
 */
const customStateStorage = {
  load: async function (fn) {
    await pg.connect()

    // Load the single row of migration data from the database
    const {rows} = await pg.query('SELECT data FROM schema.migrations')

    if (rows.length !== 1) {
      console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
      return fn(null, {})
    }

    // Call callback with new migration data object
    await pg.end()
    fn(null, rows[0].data)
  },

  save: async function (set, fn) {
    await pg.connect()

    // Check if table 'migrations' exists and if not, create it.
    await pg.query('CREATE TABLE IF NOT EXISTS schema.migrations (id integer PRIMARY KEY, data jsonb NOT NULL)')

    await pg.query(`
      INSERT INTO schema.migrations (id, data)
      VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET data = $1
    `, [{
      lastRun: set.lastRun,
      migrations: set.migrations
    }])

    await pg.end()
    fn()
  }
}

/**
 * Main application code
 */
migrate.load({
  // Set class as custom stateStore
  stateStore: customStateStorage
}, function (err, set) {
  if (err) {
    throw err
  }

  set.up((err2) => {
    if (err2) {
      throw err2
    }

    console.log('Migrations successfully ran')
  })
})
