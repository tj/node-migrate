
exports.before_load = function(path, next) {
    console.log('before_load ' + path);
    next();
}

exports.after_save = function(json, next) {
    console.log('after save ' + json);
    next();
}
