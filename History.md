1.3.0 / 2018-03-15
==================

  * Added `--extension`
  * `--extention` deprecation
  * Bug fixes

1.2.0 / 2018-01-27
==================

  * Bug fixes for promise rejections

1.1.1 / 2018-01-02
==================

  * Bug Fix

1.1.0 / 2017-12-20
==================

  * Fixes state store functionality issues

1.0.1 / 2017-12-19
==================

  * Bug fix

1.0.0 / 2017-11-30
==================

  * This was a major refactor effecting most of the codebase
  * Track migration status on a per migration basis as opposed to with an array index
  * Moved to commander for cli interface
  * Compiler support
  * State store support
  * `dotenv` support
  * See: https://github.com/tj/node-migrate/pull/77

0.2.3 / 2016-07-05
==================

  * Add date-format option for new migrations (#66)
  * Update readme: Usage section (#65)
  * Add missing license field to package.json (#64)

0.2.2 / 2015-07-07
==================

  * Fixed migration to specific point by name

0.2.1 / 2015-04-24
==================

  * Ability to use a custom template file
  * Expose easy api for programmatic use
  * State is now saved after each successful migration
  * Proper tests with `mocha`
  * Add `use strict` to the template

0.2.0 / 2014-12-26
==================

  * Report errors on migration next
  * The name format of migrations is now timestamp-based instead of numerical
  * Remove inner library version

0.1.6 / 2014-10-28
==================

  * Fix paths for windows users
  * Added command line option --state-file (to set the location of the migration state file)

0.1.3 / 2012-06-25
==================

  * Update migrate to support v0.8.x

0.1.2 / 2012-03-15
==================

  * 0.7.x support

0.1.1 / 2011-12-04
==================

  * Fixed a typo [kishorenc]

0.1.0 / 2011-12-03
==================

  * Added support for incremental migrations. [Kishore Nallan]

0.0.5 / 2011-11-07
==================

  * 0.6.0 support

0.0.4 / 2011-09-12
==================

  * Fixed: load js files only [aheckmann]

0.0.3 / 2011-09-09
==================

  * Fixed initial `create` support

0.0.2 / 2011-09-09
==================

  * Fixed `make test`

0.0.1 / 2011-04-24
==================

  * Initial release
