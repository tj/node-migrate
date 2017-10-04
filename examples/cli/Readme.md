# CLI example

This example uses the [node-flat-db](https://github.com/gabrielcsapo/node-flat-db) module to act as a mock database. 
The module returns promises on operations, and will therefore work nicely with the migration module.

First, start out by making sure we are in the correct directory:

```sh
cd ./examples/cli/
```

Then, try an 'up' migration:

```sh
migrate up
```

Down migrations should also work:

```sh
migrate down
```

A partial migration will also work:
```sh
migrate up 1316027432512-add-jane.js
```

Try playing around with the different commands, while checking out db.json.

## New migration file

To add a new migration, execute following command:

```sh
migrate create my-migration-name
```

Locate the new migration file. It should be in the migrations folder.
