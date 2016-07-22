if (typeof window === 'undefined')
  StateMachine = require('./../henderson.js');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');

describe('Example extensions', function() {

  var fsm;

  beforeEach(function() {
    fsm = new StateMachine({
      initial : 'green',
      states  : {
        green : ['red'],
        red   : ['green', 'red']
      },
    });
  });

  describe('transition helpers', function() {
    beforeEach(function() {
      fsm.can = function(state) {
        return fsm.transitions[fsm.current].indexOf(state) > -1;
      };

      fsm.cannot = function(state) {
        return fsm.transitions[fsm.current].indexOf(state) === -1;
      };

      fsm.is = function(state) {
        return fsm.current === state;
      };

      fsm.allowed = function() {
        return fsm.transitions[fsm.current];
      };
    });

    it('fsm.can', function() {
      fsm.can('red').should.equal(true);
      fsm.can('green').should.equal(false);
      fsm.can('yellow').should.equal(false);
    });

    it('fsm.cannot', function() {
      fsm.cannot('green').should.equal(true);
      fsm.cannot('red').should.equal(false);
      fsm.cannot('yellow').should.equal(true);
    });

    it('fsm.is', function(done) {
      fsm.is('green').should.equal(true);
      fsm.is('red').should.equal(false);
      fsm.go('red').then(function() {
        fsm.is('yellow').should.equal(false);
        fsm.is('green').should.equal(false);
        fsm.is('red').should.equal(true);
        done();
      });
    });

    it('fsm.allowed', function(done) {
      fsm.allowed().should.contain.members(['red']);
      fsm.go('red').then(function() {
        fsm.allowed().should.contain.members(['red', 'green']);
        done();
      });
    });
  });

  describe('event emitter helpers', function() {
    beforeEach(function() {
      fsm.once = function(evt, fn) {
        fsm.on(evt, function onceCb() {
          fn.apply(fn, Array.prototype.slice.call(arguments));
          fsm.unbind(evt, onceCb);
        });
        return fsm;
      };
    });

    it('fsm.once', function(done) {
      var spy = sinon.spy();

      fsm.once('red', spy);
      fsm.go('red')
        .then(function () {
          return fsm.go('red');
        })
        .then(function () {
          spy.callCount.should.equal(1);
          done();
        })
        .catch(done);
    });
  });

  describe('state modification helpers', function() {
    beforeEach(function() {
      fsm.add = function(state, from, to) {
        fsm.transitions[state] = to;
        from.forEach(function(elem) {
          fsm.transitions[elem].push(state);
        });
      };

      fsm.remove = function(obsolete) {
        delete fsm.transitions[obsolete];

        for (var state in fsm.transitions) {
          if (fsm.transitions.hasOwnProperty(state)) {
            var index = fsm.transitions[state].indexOf(obsolete);
            if (index > -1)
              fsm.transitions[state].splice(index, 1);
          }
        }
      }
    });

    it('fsm.add', function(done) {
      fsm.add('yellow', ['green', 'red'], ['red']);
      fsm.go('yellow')
        .then(function() {
          fsm.current.should.equal('yellow');
          done();
      });
    });

    it('fsm.remove', function(done) {
      fsm.remove('red');
      fsm.go('red')
        .then(done)
        .catch(function(e) {
          e.name.should.equal('IllegalTransitionException');
          fsm.current.should.equal('green');
          done();
        });
    });
  });

  describe('validation helpers', function() {
    beforeEach(function() {
      fsm.origo = fsm.go;
      fsm.go = function() {
        if (fsm.current === 'red')
          return false;
        else
          return fsm.origo.apply(this, Array.prototype.slice.call(arguments));
      };
    });

    it('stay at terminal state', function(done) {
      fsm.go('red')
        .then(function() {
          return fsm.go('red');
        })
        .then(function() {
          fsm.go('green').should.equal(false);
          fsm.current.should.equal('red');
          done();
        });
    });
  });
});
