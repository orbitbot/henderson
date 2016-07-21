if (typeof window === 'undefined')
  StateMachine = require('./../henderson.js');
var chai = require('chai');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect;

describe('FSM event callbacks', function() {

  function random(upper) {
    return Math.floor(Math.random() * upper) + 1;
  }

  function range(len) {
    return Array.apply(null, Array(len)).map(function (_, i) { return i; });
  }

  var fsm;

  beforeEach(function() {
    fsm = new StateMachine({
      initial : 'green',
      states  : {
        green : ['red'],
        red   : ['green', 'red'],
      }
    });
  });

  it('triggers after:event with the next state as a parameter', function(done) {
    fsm.on('after:green', function(next) {
      next.should.equal('red');
      done();
    });

    fsm.go('red')
      .catch(done);
  });

  it('triggers the before:event with the previous state as a parameter', function(done) {
    fsm.on('before:red', function(prev) {
      prev.should.equal('green');
      done();
    });

    fsm.go('red')
      .catch(done);
  });

  it('triggers the "on" event with the previous state as a parameter', function(done) {
    fsm.on('red', function(prev) {
      prev.should.equal('green');
      done();
    });

    fsm.go('red')
      .catch(done);
  });

  it('triggers the wildcard event with both next and previous states as parameters', function(done) {
    fsm.on('*', function(prev, next) {
      prev.should.equal('green');
      next.should.equal('red');
      done();
    });

    fsm.go('red')
      .catch(done);
  })

  it('passes any parameters provided to the transition function call to the callbacks', function(done) {
    var params = range(random(15)).map(function() {
      return Math.random();
    });

    fsm.on('red', function(prev, fst) {
      arguments.length.should.equal(params.length + 1);
      for (i = 0; i < params.length; ++i) {
        params[i].should.equal(arguments[i + 1]);
      }
      done();
    });

    fsm.go.apply(fsm.go, ['red'].concat(params));
  });

  it('runs callbacks in order', function(done) {
    var count = 0;
    fsm
      .on('after:green', function() {
        expect(count).to.equal(0)
        return promiseDelay(function () {
          count++;
        }, 1);
      })
      .on('before:red', function() {
        expect(count).to.equal(1, 'should run after previous is done')
        return promiseDelay(function () {
          count++;
        }, 1);
      })
      .on('red', function() {
        expect(count).to.equal(2);
      })

    fsm.go('red')
      .then(function() {
        done();
      })
      .catch(done);
  });
});

function promiseDelay (fn, delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      try {
        resolve(fn());
      } catch(error) {
        reject(error);
      }
    }, delay)
  })
}
