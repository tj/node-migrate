const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const Bluebird = require('bluebird');

Bluebird.promisifyAll(MongoClient);

class MongoDbStore {
    constructor() {
        this.url = 'mongodb://localhost/test';
    }

    connect() {
        return MongoClient.connect(this.url)
            .then(client => {
                return client.db()
            })
    }

    load(fn) {
        return this.connect()
            .then(db => db.collection('db_migrations').find().toArray())
            .then(data => {
                if (!data.length) return fn(null, {});
                const store = data[0];
                if (!MongoDbStore.hasProperty(store, 'lastRun') ||
                    !MongoDbStore.hasProperty(store, 'migrations')) {
                    return fn(new Error('I`nvalid store file'))
                }
                return fn(null, store)
            }).catch(fn)
    }

    static hasProperty(store, property) {
        return Object
            .prototype
            .hasOwnProperty
            .call(store, property);
    }

    save(set, fn) {
        return this.connect()
            .then(db => db.collection('db_migrations')
                .update({},
                    {
                        $set: {
                            lastRun: set.lastRun,
                        },
                        $push: {
                            migrations: {$each: set.migrations},
                        },
                    },
                    {
                        upsert: true,
                        multi: true,
                    }
                ))
            .then(result => fn(null, result))
            .catch(fn)
    }
}

module.exports = MongoDbStore;
