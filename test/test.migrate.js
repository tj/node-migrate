
/**
 * Module dependencies.
 */

var migrate = require('../')
  , should = require('should')
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
        testMigrationEvents();
      });
    });
  });
}

// test events

function testMigrationEvents() {
  migrate('adjust emails', function(next){
    db.pets.forEach(function(pet){
      if (pet.email)
        pet.email = pet.email.replace('learnboost.com', 'lb.com');
    });
    next();
  }, function(next){
    db.pets.forEach(function(pet){
      if (pet.email)
        pet.email = pet.email.replace('lb.com', 'learnboost.com');
    });
    next();
  });

  var migrations = []
    , completed = 0
    , expectedMigrations = [
      'add guy ferrets'
    , 'add girl ferrets'
    , 'add emails'
    , 'add dogs'
    , 'adjust emails'];

  set.on('migration', function(migration, direction){
    migrations.push(migration.title);
    direction.should.be.a('string');
  });

  set.on('complete', function(){
    ++completed;
  });

  set.up(function(){
    db.pets[0].email.should.equal('tobi@lb.com');
    migrations.should.eql(expectedMigrations);
    completed.should.equal(1);

    migrations = [];
    set.down(function(){
      migrations.should.eql(expectedMigrations.reverse());
      completed.should.equal(2);
      assertNoPets();
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
  db.pets[0].name.should.equal('tobi');
  db.pets[0].email.should.equal('tobi@learnboost.com');
  db.pets[4].name.should.equal('suki');
};