var fs = require('fs');

function StateFile(path) {
    this.path = path;
}

/**
 * A method for loading state. This method will be called with only one
 * argument; a callback.
 *
 * The callback is a standard node.js callback, that takes an error as the first
 * argument, and the loaded state as the second argument. The state must be
 * returned as a plain javascript object.
 */
StateFile.prototype.load = function (cb) {
    fs.readFile(this.path, 'utf8', function (err, text) {
        if (err) return cb(err);
        try {
            cb(null, JSON.parse(text));
        } catch (e) {
            cb(e);
        }
    });
};

/**
 * A method for saving state. This method will be called with two arguments.
 *
 * - an object with the state that will need to be persisted.
 * - a callback
 *
 * The callback takes an error as the only argument.
 */
StateFile.prototype.save = function (state, cb) {
    var json = JSON.stringify(state);
    fs.writeFile(this.path, json, function (err) {
        if (err) return cb(err);
        cb(null);
    });
};

module.exports = StateFile;
