;(function (root) {
  function ITE(prev, next) {
    var error = Error.call(this, 'Transition from ' + prev + ' to ' + next + ' is not allowed');
    error.name = 'IllegalTransitionException';
    return error;
  }

  function series(tasks, params, check, cb) {
    var results = [];
    return tasks
            .reduce(function(series, task, index) {
              if (index === check) cb();
              return series
                      .then(task.apply(task, params))
                      .then(results.push.bind(results));
            },
            Promise.resolve()
    ).then(function () {
      return results;
    });
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

      var pre = getCbs('after:' + prev).concat(getCbs('before:' + next));
      var post = getCbs(next).concat(getCbs('*'));

      return series(pre.concat(post), params, pre.length + 1, function() { fsm.current = next; });
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
