var fs = require('fs');

function StateFile(path) {
    this.path = path;
}

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

StateFile.prototype.save = function (json, cb) {
    fs.writeFile(this.path, json, function (err) {
        if (err) return cb(err);
        cb(null);
    });
};

module.exports = StateFile;
