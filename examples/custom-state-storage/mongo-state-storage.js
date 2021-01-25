'use strict'
const migrate = require('migrate')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost/test'

class MongoDbStore {
  async load (fn) {
    let client = null
    let data = null
    try {
      client = await MongoClient.connect(url)
      const db = client.db()
      data = await db.collection('db_migrations').find().toArray()
      if (data.length !== 1) {
        console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
        return fn(null, {})
      }
    } catch (err) {
      return fn(err)
    } finally {
      client.close()
    }
    return fn(null, data[0])
  };

  async save (set, fn) {
    let client = null
    let result = null
    try {
      client = await MongoClient.connect(url)
      const db = client.db()
      result = await db.collection('db_migrations')
        .update({}, {
          $set: {
            lastRun: set.lastRun
          },
          $push: {
            migrations: { $each: set.migrations }
          }
        }, { upsert: true })
    } catch (err) {
      return fn(err)
    } finally {
      client.close()
    }

    return fn(null, result)
  }
}

/**
 * Main application code
 */
migrate.load({
  // Set class as custom stateStore
  stateStore: new MongoDbStore()
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
