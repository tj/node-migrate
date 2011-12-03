
# migrate

  Abstract migration framework for node

## Installation

    $ npm install migrate

## Usage

```
Usage: migrate [options] [command]

Options:

   -c, --chdir <path>   change the working directory

Commands:

   down             migrate down
   up               migrate up (the default command)
   create [title]   create a new migration file with optional [title]

```

## Creating Migrations

To create a migration, execute `migrate create` with an optional title. `node-migrate` will create a node module within `./migrations/` which contains the following two exports:

    exports.up = function(next){
      next();
    };

    exports.down = function(next){
      next();
    };

All you have to do is populate these, invoking `next()` when complete, and you are ready to migrate!

For example:

    $ migrate create add-pets
    $ migrate create add-owners

The first call creates `./migrations/000-add-pets.js`, which we can populate:

      var db = require('./db');

      exports.up = function(next){
        db.rpush('pets', 'tobi');
        db.rpush('pets', 'loki');
        db.rpush('pets', 'jane', next);
      };

      exports.down = function(next){
        db.rpop('pets');
        db.rpop('pets', next);
      };

The second creates `./migrations/001-add-owners.js`, which we can populate:

      var db = require('./db');

      exports.up = function(next){
        db.rpush('owners', 'taylor');
        db.rpush('owners', 'tj', next);
      };

      exports.down = function(next){
        db.rpop('owners');
        db.rpop('owners', next);
      };

## Running Migrations

When first running the migrations, all will be executed in sequence.

    $ migrate
    up : migrations/000-add-pets.js
    up : migrations/001-add-jane.js
    up : migrations/002-add-owners.js
    up : migrations/003-coolest-pet.js
    migration : complete

Subsequent attempts will simply output "complete", as they have already been executed in this machine. `node-migrate` knows this because it stores the current state in `./migrations/.migrate` which is typically a file that SCMs like GIT should ignore.

    $ migrate
    migration : complete

If we were to create another migration using `migrate create`, and then execute migrations again, we would execute only those not previously executed:

    $ migrate
    up : migrates/004-coolest-owner.js

You can also run migrations incrementally by specifying a migration.

  $ migrate up 002-coolest-pet.js
  up : migrations/000-add-pets.js
  up : migrations/001-add-jane.js
  up : migrations/002-add-owners.js
  migration : complete

This will run up-migrations upto (and including) `002-coolest-pet.js`. Similarly you can run down-migrations upto (and including) a specific migration, instead of migrating all the way down.

  $ migrate down 001-add-jane.js
  down : migrations/002-add-owners.js
  down : migrations/001-add-jane.js
  migration : complete

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.