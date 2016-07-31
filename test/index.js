var path = require('path');

var getStoreUnderTest = function(base) {
  var STATE = path.join(base, '.migrate');
  return {Store: require('migrate-filestore'), args: [{stateFile: STATE}]}
};

var BASIC_BASE = path.join(__dirname, 'common', 'fixtures', 'basic');
var basicTests = require('./common/basic');
describe('basic migration', basicTests(BASIC_BASE, getStoreUnderTest(BASIC_BASE)));

var ISSUE33_BASE = path.join(__dirname, 'common', 'fixtures', 'issue-33');
var issue33 = require('./common/issue-33');
describe('issue-33', issue33(ISSUE33_BASE, getStoreUnderTest(ISSUE33_BASE)));