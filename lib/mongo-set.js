var Set = require('./set');
var mongo = require('promised-mongo');

function MongoSet(connectionStringEnv, migrationCollection) {
  Set.call(this, 'mongo');
  this.connectionString = process.env[connectionStringEnv];
  this.migrationCollection = migrationCollection || 'migrations';
}

MongoSet.prototype = Object.create(Set.prototype);
MongoSet.prototype.constructor = MongoSet;

MongoSet.prototype.load = function(fn) {
  this.emit('load');
  var migrations = mongo(this.connectionString)[this.migrationCollection];
  migrations.findOne({})
    .then(res => fn(null, res || {}))
    .catch(fn);
};

MongoSet.prototype.save = function(fn) {
  this.emit('load');
  var migrations = mongo(this.connectionString)[this.migrationCollection];
  var json = JSON.parse(JSON.stringify(this));
  migrations
    .update({}, json, { upsert: true })
    .then(res => fn(null, res || {}))
    .catch(fn);
};

module.exports = MongoSet;
