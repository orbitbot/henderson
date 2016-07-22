;(function (root) {
  function ITE(prev, next) {
    var error = Error.call(this, 'Transition from ' + prev + ' to ' + next + ' is not allowed');
    error.name = 'IllegalTransitionException';
    error.prev = prev;
    error.attempt = next;
    return error;
  }

  function FSM(config) {
    var events = {};
    var fsm = {
      transitions : config.states,
      current     : config.initial,
      error       : config.error,
    };
    fsm.bind = function(evt, fn) {
      events[evt] = events[evt] || [];
      events[evt] = events[evt].concat(fn);
      return fsm;
    };
    fsm.unbind = function(evt, fn) {
      if (evt in events && events[evt].indexOf(fn) > -1)
        events[evt].splice(events[evt].indexOf(fn), 1);
      return fsm;
    };
    fsm.on = fsm.bind;

    function getCbs(key) {
      return events[key] || [];
    }

    fsm.go = function(next) {
      var prev = fsm.current;
      var params = Array.prototype.slice.call(arguments, 1);

      if (fsm.transitions[prev].indexOf(next) < 0)
        return Promise.reject(new ITE(prev, next));

      var after = getCbs('after:' + prev);
      var pre = getCbs('before:' + next);
      var on = getCbs(next);
      var post = getCbs('*');

      var beforePost = after.concat(pre, on);
      function getPrefix(index) {
        return (index < after.length ? [next] : index < beforePost.length ? [prev] : [prev, next]);
      }

      var stateChange = after.length + pre.length;

      return beforePost
        .concat(post, function ensureStateChange() {})
        .reduce(function(series, task, index) {
          var args = getPrefix(index).concat(params);
          return series.then(function() {
            if (index === stateChange) {
              fsm.current = next;
            }

            return task.apply(task, args);
          });
        }, Promise.resolve());
    }

    return fsm;
  }

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define(function () { return FSM; });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = FSM;
  } else if (typeof self !== 'undefined') {
    self.StateMachine = FSM;
  } else {
    root.StateMachine = FSM;
  }
}(this));
