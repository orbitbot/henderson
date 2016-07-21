if (typeof window === 'undefined')
  StateMachine = require('./../henderson.js');
var chai = require('chai');
var sinon = require('sinon');
var should = chai.should();

describe('FSM event emitter', function() {

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

  it('supports registering callbacks that will be fired when matching transitions occur', function(done) {
    var spy = sinon.spy();

    fsm.on('red', spy);
    fsm.go('red')
      .then(function () {
        spy.callCount.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('supports de-registering named callback functions', function(done) {
    var spy = sinon.spy();

    fsm.on('red', spy);
    fsm.go('red')
      .then(function () {
        fsm.unbind('red', spy);
        return fsm.go('red');
      })
      .then(function () {
        spy.callCount.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('does not remove unrelated callbacks if unbind is called with a method not registered', function(done) {
    var spy = sinon.spy();

    fsm.on('red', spy);
    fsm.unbind('red', function() {});
    fsm.go('red')
      .then(function () {
        spy.callCount.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('fires only callbacks matching the event', function(done) {
    var fst = sinon.spy();
    var snd = sinon.spy();
    fsm.on('red', fst);
    fsm.on('green', snd);

    fsm.go('red')
      .then(function () {
        fst.callCount.should.equal(1);
        snd.called.should.equal(false);
        return fsm.go('green');
      })
      .then(function () {
        fst.callCount.should.equal(1);
        snd.callCount.should.equal(1);
        done();
      })
      .catch(done);
  });

  it('supports registering any number of callbacks for a single event', function() {
    var count = random(15);
    var called = new Array(count);

    for (var i = 0; i < called; ++i) {
      fsm.on('red', function() { called[i] = true; });
    }
    fsm.go('red');

    for (var i = 0; i < called; ++i) {
      called[i].should.equal(true);
    }
  });

  it('runs callbacks in the order registered', function() {
    var called = { 0: false, 1: false, 2: false };

    function cb(index) {
      return function() {
        called.index = true;
        var prev = called[index - 1];
        var next = called[index + 1];

        if (prev) prev.should.equal(true);
        if (next) next.should.equal(false);
      }
    }

    fsm.on('red', cb(0));
    fsm.on('red', cb(1));
    fsm.on('red', cb(2));
    fsm.go('red');
  });
});
