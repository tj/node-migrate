# Migrate

[![NPM Version](https://img.shields.io/npm/v/migrate.svg)](https://npmjs.org/package/migrate)
[![NPM Downloads](https://img.shields.io/npm/dm/migrate.svg)](https://npmjs.org/package/migrate)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/tj/node-migrate.svg?branch=master)](https://travis-ci.org/tj/node-migrate)

Abstract migration framework for node.

## Installation

    $ npm install migrate

## Usage

```
Usage: migrate [options] [command]

Options:

  -V, --version  output the version number
  -h, --help     output usage information

Commands:

  init           Initalize the migrations tool in a project
  list           List migrations and their status
  create <name>  Create a new migration
  up [name]      Migrate up to a give migration
  down [name]    Migrate down to a given migration
  help [cmd]     display help for [cmd]
```

For help with the individual commands, see `migrate help [cmd]`.  Each command has some helpful flags
for customising the behavior of the tool.

## Programmatic usage

```javascript
var migrate = require('migrate')

migrate.load({
  stateStore: '.migrate'
}, function (err, set) {
  if (err) {
    throw err
  }
  set.up(function (err) {
    if (err) {
      throw err
    }
    console.log('migrations successfully ran')
  })
})
```

## Creating Migrations

To create a migration, execute `migrate create <title>` with a title. By default, a file in `./migrations/` will be created with the following content:

```javascript
'use strict'

module.exports.up = function (next) {
  next()
}

module.exports.down = function (next) {
  next()
}
```

All you have to do is populate these, invoking `next()` when complete, and you are ready to migrate!

For example:

```
$ migrate create add-pets
$ migrate create add-owners
```

The first call creates `./migrations/{timestamp in milliseconds}-add-pets.js`, which we can populate:

```javascript
// db is just an object shared between the migrations
var db = require('./db');

exports.up = function (next) {
  db.pets = [];
  db.pets.push('tobi')
  db.pets.push('loki')
  db.pets.push('jane')
  next()
}

exports.down = function (next) {
  db.pets.pop('pets')
  db.pets.pop('pets')
  db.pets.pop('pets')
  delete db.pets
  next()
}
```

The second creates `./migrations/{timestamp in milliseconds}-add-owners.js`, which we can populate:

```javascript
var db = require('./db');

exports.up = function (next) {
  db.owners = [];
  db.owners.push('taylor')
  db.owners.push('tj', next)
}

exports.down = function (next) {
  db.owners.pop()
  db.owners.pop()
  delete db.owners
  next()
}
```

### Advanced migration creation

When creating migrations you have a bunch of other options to help you control how the migrations
are created.  You can fully configure the way the migration is made with a `generator`, which is just a 
function exported as a node module.  A good example of a generator is the  default one [shipped with
this package](https://github.com/tj/node-migrate/blob/b282cacbb4c0e73631d651394da52396131dd5de/lib/template-generator.js).

The `create` command accepts a flag for pointing the tool at a generator, for example:

```
$ migrate create --generator ./my-migrate-generator.js
```

A more simple and common thing you might want is to just change the default template file which is created.  To do this, you
can simply pass the `template-file` flag:

```
$ migrate create --template-file ./my-migration-template.js
```

Lastly, if you want to use newer ECMAscript features, or language addons like TypeScript, for your migrations, you can
use the `compiler` flag.  For example, to use babel with your migrations, you can do the following:

```
$ npm install --save babel-register
$ migrate create --compiler="js:babel-register" foo
$ migrate up --compiler="js:babel-register"
```

## Running Migrations

When first running the migrations, all will be executed in sequence.

```
$ migrate
  up : migrations/1316027432511-add-pets.js
  up : migrations/1316027432512-add-jane.js
  up : migrations/1316027432575-add-owners.js
  up : migrations/1316027433425-coolest-pet.js
  migration : complete
```

Subsequent attempts will simply output "complete", as they have already been executed. `migrate` knows this because it stores the current state in 
`./.migrate` which is typically a file that SCMs like GIT should ignore.

```
$ migrate
  migration : complete
```

If we were to create another migration using `migrate create`, and then execute migrations again, we would execute only those not previously executed:

```
$ migrate
  up : migrates/1316027433455-coolest-owner.js
```

You can also run migrations incrementally by specifying a migration.

```
$ migrate up 1316027433425-coolest-pet.js
  up : migrations/1316027432511-add-pets.js
  up : migrations/1316027432512-add-jane.js
  up : migrations/1316027432575-add-owners.js
  up : migrations/1316027433425-coolest-pet.js
  migration : complete
```

This will run up-migrations up to (and including) `1316027433425-coolest-pet.js`. Similarly you can run down-migrations up to (and including) a
specific migration, instead of migrating all the way down.

```
$ migrate down 1316027432512-add-jane.js
  down : migrations/1316027432575-add-owners.js
  down : migrations/1316027432512-add-jane.js
  migration : complete
```

Any time you want to see the current state of the migrations, you can run `migrate list` to see an output like:

```
$ migrate list
  1316027432511-add-pets.js [2017-09-23] : <No Description>
  1316027432512-add-jane.js [2017-09-23] : <No Description>
```

The description can be added by exporting a `description` field from the migration file.

## Custom State Storage

By default, `migrate` stores the state of the migrations which have been run in a file (`.migrate`).  But you
can provide a custom storage engine if you would like to do something different, like storing them in your database of choice.
A storage engine has a simple interface of `load(fn)` and `save(set, fn)`.  As long as what goes in as `set` comes out
the same on `load`, then you are good to go!

If you are using the provided cli, you can specify the store implementation with the `--store` flag, which is be a `require`-able node module.  For example:

```
$ migrate up --store="my-migration-store"
```

## API

### `migrate.load(opts, cb)`

Calls the callback with a `Set` based on the options passed.  Options:

- `set`: A set instance if you created your own
- `stateStore`: A store instance to load and store migration state, or a string which is a path to the migration state file
- `migrationsDirectory`: The path to the migrations directory
- `filterFunction`: A filter function which will be called for each file found in the migrations directory
- `sortFunction`: A sort function to ensure migration order

### `Set.up([migration, ]cb)`

Migrates up to the specified `migration` or, if none is specified, to the latest
migration. Calls the callback `cb`, possibly with an error `err`, when done.

### `Set.down([migration, ]cb)`

Migrates down to the specified `migration` or, if none is specified, to the
first migration. Calls the callback `cb`, possibly with an error `err`, when
done.
