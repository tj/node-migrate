exports.save = function(fn){
  // write to database and execute callback & send event
  console.log(JSON.stringify(this));
  this.emit('save');
  fn && fn();
}

exports.load = function(fn){
  // send load event before callback
  this.emit('load');
  // load from database and execute callback
  fn(null, JSON.parse('{}'));
}
