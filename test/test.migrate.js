
/**
 * Module dependencies.
 */

var migrate = require('../')
  , should = require('../support/should')
  , fs = require('fs');

// remove migration file

try {
  fs.unlinkSync(__dirname + '/.migrate');
} catch (err) {
  // ignore
}

// dummy db

var db = { pets: [] };

// dummy migrations

migrate(__dirname + '/.migrate');

migrate('add guy ferrets', function(next){
  db.pets.push({ name: 'tobi' });
  db.pets.push({ name: 'loki' });
  next();
}, function(next){
  db.pets.pop();
  db.pets.pop();
  next();
});

migrate('add girl ferrets', function(next){
  db.pets.push({ name: 'jane' });
  next();
}, function(next){
  db.pets.pop();
  next();
});

migrate('add emails', function(next){
  db.pets.forEach(function(pet){
    pet.email = pet.name + '@learnboost.com';
  });
  next();
}, function(next){
  db.pets.forEach(function(pet){
    delete pet.email;
  });
  next();
});

// tests

migrate.version.should.match(/^\d+\.\d+\.\d+$/);

// test migrating up / down several times

var set = migrate();

set.up(function(){
  assertPets();
  set.up(function(){
    assertPets();
    set.down(function(){
      assertNoPets();
      set.down(function(){
        assertNoPets();
        set.up(function(){
          assertPets();
          testNewMigrations();
        });
      });
    });
  });
});

// test adding / running new migrations

function testNewMigrations() {
  migrate('add dogs', function(next){
    db.pets.push({ name: 'simon' });
    db.pets.push({ name: 'suki' });
    next();
  }, function(next){
    db.pets.pop();
    db.pets.pop();
    next();
  });

  set.up(function(){
    assertPets.withDogs();
    set.up(function(){
      assertPets.withDogs();
      set.down(function(){
        assertNoPets();
      });
    });
  });
}

// helpers

function assertNoPets() {
  db.pets.should.be.empty;
}

function assertPets() {
  db.pets.should.have.length(3);
  db.pets[0].name.should.equal('tobi');
  db.pets[0].email.should.equal('tobi@learnboost.com');
}

assertPets.withDogs = function(){
  db.pets.should.have.length(5);
  db.pets[4].name.should.equal('suki');
};