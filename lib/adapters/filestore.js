/**
 * Created by arolave on 26/07/2016.
 */
var fs = require('fs');
var readline = require('readline')

module.exports = FileStore;

function FileStore(path) {
    this.path = path;
}

FileStore.prototype.load = function (callback) {
    var stream = require('fs').createReadStream(this.path, {encoding: 'utf8'});
    var lineReader = readline.createInterface({
        input: stream
    });

    var arr = [];

    lineReader.on('line', function (line) {
        console.log(line);
        try {
            arr.push(JSON.parse(line));
        } catch(err) {
            callback(err);
        }

    });

    lineReader.on('close', function (err) {
        callback(err, arr);
    });

    stream.on('error', function (err) {
        callback(err);
    });
};

FileStore.prototype.save = function (migration, callback) {
    fs.appendFile(this.path, JSON.stringify(migration) + '\n', 'utf8', callback);
};

FileStore.prototype.reset = function (callback) {
    fs.unlink(this.path, callback)
};