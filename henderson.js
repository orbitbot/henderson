;(function (root) {
  function ITE(prev, next) {
    var error = Error.call(this, 'Transition from ' + prev + ' to ' + next + ' is not allowed');
    error.name = 'IllegalTransitionException';
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
      events[evt].push(fn);
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
        return Promise.reject(new ITE(prev, next), prev, next);

      var after = getCbs('after:' + prev);
      var pre = getCbs('before:' + next);
      var on = getCbs(next);
      var post = getCbs('*');

      function getPrefix(index) {
        if (index < after.length) {
          return [next];
        } else if (index < after.length + pre.length + on.length) {
          return [prev];
        }
        return [prev, next];
      }
      var stateChange = after.length + pre.length;
      var results = [];
      return after.concat(pre, on, post)
              .reduce(function(series, task, index) {
                if (index === stateChange)
                  fsm.current = next;

                return series
                        .then(task.apply(task, getPrefix(index).concat(params)))
                        .then(results.push.bind(results));
              },
              Promise.resolve()
      ).then(function () {
        return results;
      // }).catch(function(err) {
      //   fsm.current = prev;
      //   return err;
      //   return Promise.reject(err, results);
      });
    };

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
