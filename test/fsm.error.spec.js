if (typeof window === 'undefined')
  StateMachine = require('./../henderson.js');
var chai = require('chai');
var sinon = require('sinon');
var should = chai.should();

describe('FSM Error handling', function() {

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

  it('rejects the transition promise if an illegal transition is attempted', function(done) {
    fsm.go('green')
      .then(done)
      .catch(function(error) {
        error.name.should.equal('IllegalTransitionException');
        error.message.should.not.equal(undefined);
        error.prev.should.equal('green');
        error.attempt.should.equal('green');
        done();
      });
  });

  it('rejects the transition promise if a transition callback returns a rejected promise', function(done) {
    fsm.on('red', function() {
      return Promise.reject('failed')
    });
    fsm.go('red')
      .then(done)
      .catch(function(error) {
        error.should.equal('failed');
        done();
      });
  });

  it('rejects the transition promise if an error is thrown in a transition callback', function(done) {
    fsm.on('red', function() {
      throw new Error('intentional');
    });
    fsm.go('red')
      .then(done)
      .catch(function(error) {
        error.message.should.equal('intentional');
        done();
      });
  });
});
