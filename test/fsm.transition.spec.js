if (typeof window === 'undefined')
  StateMachine = require('./../henderson.js');
var chai = require('chai');
var sinon = require('sinon');
var should = chai.should();

describe('FSM transitions', function() {

  function random(upper) {
    return Math.floor(Math.random() * upper) + 1;
  }

  var fsm;

  beforeEach(function() {
    fsm = new StateMachine({
      initial : 'green',
      states  : {
        green : ['red'],
        red   : ['green'],
      }
    });
  });

  it('updates the current state on transitions', function(done) {
    fsm.current.should.equal('green');

    fsm.go('red')
      .then(function() {
        fsm.current.should.equal('red');
        done();
      })
      .catch(done);
  });

  it('emits an event when changing to the next state', function(done) {
    fsm.on('red', function() { done() });
    fsm.go('red');
  });

  it('emits an exit event from the previous state containing the next state on a legal transition', function(done) {
    fsm.on('after:green', function(next) {
      next.should.equal('red');
      done();
    });
    fsm.go('red');
  });

  it('emits an enter event containing the previous state before state is changed', function(done) {
    fsm.on('before:red', function(prev) {
      prev.should.equal('green');
      done();
    });
    fsm.go('red');
  });

  it('emits an "*" wildcard event containing both the previous and newly entered states', function(done) {
    var parameter = new Date();
    fsm.on('*', function(prev, entered, param) {
      prev.should.equal('green');
      entered.should.equal('red');
      fsm.current.should.equal('red');
      param.should.equal(parameter);
      done();
    });

    fsm.go('red', parameter);
  });

  it('changes the state after the "after:" and "before:" events but before the main event', function(done) {
    var spy = sinon.spy();
    fsm.on('after:green', function() {
      spy();
      fsm.current.should.equal('green');
    });
    fsm.on('before:red', function() {
      spy();
      fsm.current.should.equal('green');
    });
    fsm.on('red', function() {
      spy();
      fsm.current.should.equal('red');
      spy.callCount.should.equal(3);
      done();
    });
    fsm.go('red');
  });

  it('fires the "all" event on every transition', function(done) {
    var spy = sinon.spy();
    var rnd = random(15);
    var promises = [];

    fsm.on('*', spy);
    for (var i = 0; i < rnd; ++i) {
      promises.push(function () {
        return fsm.go(fsm.current === 'red' ? 'green' : 'red')
      });
    }

    return promises.reduce(function(series, task) {
      return series.then(task)
    }, Promise.resolve())
      .then(function () {
        spy.callCount.should.equal(rnd);
        done();
      })
      .catch(done);
  });
});
