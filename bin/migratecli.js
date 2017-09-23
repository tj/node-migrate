/**
 * Module dependencies.
 */

var migrate = require('../')
  , join = require('path').join
  , fs = require('fs')
  , dateFormat = require('dateformat');

/**
 * Arguments.
 */

var args = process.argv.slice(2);

/**
 * Option defaults.
 */

var options = { args: [] };

/**
 * Current working directory.
 */

var cwd;

/**
 * Migration template.
 */
var template = [
  '\'use strict\''
  , ''
  , 'exports.up = function(next) {'
  , '  next();'
  , '};'
  , ''
  , 'exports.down = function(next) {'
  , '  next();'
  , '};'
  , ''
].join('\n');

/**
 * Usage information.
 */

var migrationCliHandlers = [
  {
    usageOptions: [
      '     -c, --chdir <path>      change the working directory'
      , '     --template-file <path>  set path to template file to use for new migrations'
      , '     --date-format <format>  set a date format to use for new migration filenames'
      , '     --store <string>  select the db adapter to use: file (default) or mongo'
    ],
    parseArg    : function (arg) {
      switch (arg) {
        case '-h':
        case '--help':
        case 'help':
          console.log(usage);
          process.exit();
          return true;
        case '-c':
        case '--chdir':
          process.chdir(cwd = required());
          return true;
        case '--store':
          return 'store';
        case '--template-file':
          template = fs.readFileSync(required());
          return true;
        case '--date-format':
          return 'dateFormat'
      }
    }
  }
];

['file', 'mongo'].forEach(function(storeType) {
  try {
    var Store = require('migrate-' + storeType + 'store');
    if (Store.cliHandler)
      migrationCliHandlers.push(Store.cliHandler)
  } catch(e) {
    //ignore missing types
  }
});

var usageArr = [
  ''
  , '  Usage: migrate [options] [command]'
  , ''
  , '  Options:'
  , ''];

migrationCliHandlers.forEach(function (handler) {
  usageArr = usageArr.concat(handler.usageOptions)
});

usageArr = usageArr.concat([
  , '  Commands:'
  , ''
  , '     down   [name]    migrate down till given migration'
  , '     up     [name]    migrate up till given migration (the default command)'
  , '     create [title]   create a new migration file with optional [title]'
  , ''
]);
var usage = usageArr.join('\n');

// require an argument

function required() {
  if (args.length) return args.shift();
  abort(arg + ' requires an argument');
}

// abort with a message

function abort(msg) {
  console.error('  %s', msg);
  process.exit(1);
}

// parse arguments
var arg;
while (args.length) {
  arg = args.shift();
  var optionKey;
  for (var i = 0; i<migrationCliHandlers.length; i++) {
    optionKey = migrationCliHandlers[i].parseArg(arg)
    if (typeof optionKey === 'string')
      options[optionKey] = required();
    if (optionKey)
      break;
  }
  if (!optionKey) {
    // default case
    if (options.command) {
      options.args.push(arg);
    } else {
      options.command = arg;
    }
  }
}

/**
 * Log a keyed message.
 */

function log(key, msg) {
  console.log('  \033[90m%s :\033[0m \033[36m%s\033[0m', key, msg);
}

/**
 * Slugify the given `str`.
 */

function slugify(str) {
  return str.replace(/\s+/g, '-');
}

// create ./migrations

try {
  fs.mkdirSync('migrations', 0774);
} catch (err) {
  // ignore
}

// commands

var commands = {

  /**
   * up [name]
   */

  up: function(migrationName){
    performMigration('up', migrationName);
  },

  /**
   * down [name]
   */

  down: function(migrationName){
    performMigration('down', migrationName);
  },

  /**
   * create [title]
   */

  create: function(){
    var curr = Date.now()
      , title = slugify([].slice.call(arguments).join(' '));
    if (options.dateFormat) {
      curr = dateFormat(curr, options.dateFormat);
    }
    title = title ? curr + '-' + title : curr;
    create(title);
  }
};

/**
 * Create a migration with the given `name`.
 *
 * @param {String} name
 */

function create(name) {
  var path = join('migrations', name + '.js');
  log('create', join(process.cwd(), path));
  fs.writeFileSync(path, template);
}

/**
 * Perform a migration in the given `direction`.
 *
 * @param {Number} direction
 */

function performMigration(direction, migrationName) {
  var storeType = options.store || 'file';
  var Store = require('migrate-'  + storeType + 'store');

  var store = new (Function.prototype.bind.apply(Store, [null].concat(options)));

  var set = migrate.load(store, 'migrations');

  set.on('migration', function(migration, direction){
    log(direction, migration.title);
  });

  set[direction](migrationName, function (err) {
    if (err) {
      log('error', err);
      process.exit(1);
    }

    log('migration', 'complete');
    process.exit(0);
  });
}

// invoke command

var command = options.command || 'up';
if (!(command in commands)) abort('unknown command "' + command + '"');
command = commands[command];
command.apply(this, options.args);

