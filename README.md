# henderson
> A tiny event emitter-based finite state machine, with promises

[![Build Status](https://travis-ci.org/orbitbot/henderson.svg?branch=master)](https://travis-ci.org/orbitbot/henderson)
![Uncompressed size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.js?color=red)
![minfied size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.min.js?color=yellow&label=minfied size)
![minfied+gzipped size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.min.js?label=gzipped.min&compression=gzip)

A tiny finite state machine library with asynchronous state transfers, based on an event-emitter. `henderson` is the promise-based version of [`pastafarian`](https://github.com/orbitbot/pastafarian).

###### Features
- tiny finite state machine library, only slightly bigger than its synchronous cousin [`pastafarian`](https://github.com/orbitbot/pastafarian)
- simple but powerful API
- works without dependencies on modern browsers (see requirements)
- well below 100 LOC, small enough to read and understand immediately

<br>

### Example

```js
var state = new StateMachine({
  initial : 'start',
  states  : {
    start : ['end', 'start'],
    end   : ['start']
  }
});

state.on('*', function(prev, next) {
  console.log('State changed from ' + prev + ' to ' + next);
});

state
  .on('before:start', function(prev, param) {
    console.log('Reset with param === "foo": ' + param === 'foo');
  })
  .on('after:start', function(next) {
    console.log('Going to ' + next);
  })
  .on('end', function(prev, param) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        console.log('Now at end, 2 + 2 = ' + param);
        resolve();
      }, 1500);
    });
  });

state.go('end', 2 + 2)
  .then(function() {
    console.log('Transition finished!');
  });

state.reset = state.go.bind(state, 'start');
state.reset('foo');
```

### Installation

Right click to save or use the URLs in your script tags

- [`henderson.js`](https://cdn.rawgit.com/orbitbot/henderson/master/henderson.js)
- [`henderson.min.js`](https://cdn.rawgit.com/orbitbot/henderson/master/henderson.min.js)

or use

```sh
$ npm install henderson
$ bower install henderson
```

If you're using `henderson` in a browser environment, the constructor is attached to the `StateMachine` global.

<br>

### Usage

`henderson` is very similar in usage to [`pastafarian`](https://github.com/orbitbot/pastafarian) and most of the documentation in that project can be directly applied to `henderson` as well.

##### Differences to `pastafarian`

Given `var fsm = new StateMachine(config)`,

| feature           | `pastafarian` | `henderson` | comment                                                               |
|:------------------|:--------------|:------------|:----------------------------------------------------------------------|
| config.initial    | Y             | Y           | identical                                                             |
| config.states     | Y             | Y           | identical                                                             |
| config.error      | Y             | N           | use the error callback on the promise returned from `fsm.go`          |
| `fsm.bind`        | Y             | Y           | identical                                                             |
| `fsm.on`          | Y             | Y           | identical                                                             |
| `fsm.unbind`      | Y             | Y           | identical                                                             |
| `fsm.go`          | Y             | Y           | returns a promise, which is resolved when all callbacks have finished |
| `fsm.current`     | Y             | Y           | identical                                                             |
| `fsm.transitions` | Y             | Y           | identical                                                             |
| `fsm.error`       | Y             | N           | use the error callback on the promise returned from `fsm.go`          |


- no error handling through try/catch blocks or with a defined error handler function, use `.catch` on individual `.go` calls instead

**`fsm.go(state /* ...args */) ⇒ Promise`**

Transitions the state machine to `state` and causes any registered callbacks for this transition (including `before:`, `after:` and wildcard callbacks) to be triggered. All parameters after `state` are passed on to each callback along with the states involved in the transition, see the [Event callback API](github.com/orbitbot/pastafarian/blob/master/README.md#event-callback-api) for the exact signatures.

`fsm.go` returns a promise that will be resolved when all the callbacks registered for the transition have finished. All registered functions will run in strict order, if a callback returns a promise the subsequent callback will not be run before the previous promise is resolved. If a callback returns a rejected promise, the subsequent registered functions will not be called. The statemachine may however have already transitioned to the new `state`, depending on which transition event the callbacks have been registered to, and state rollback should be taken care of by library users as appropriate.

<br>

##### Error handling

`fsm.go` will return a Promise, and the transition promise will reject if any of the transition callbacks either return a rejected promise or an uncaught exception is thrown. In the case that an illegal transition is attempted, the `.catch` error callback will be called with an *IllegalTransitionException*:

###### IllegalTransitionException

`henderson` defines a custom exception which is generated when the transitions array of the current state doesn't contain the state (next) passed to `fsm.go`:

- name : `IllegalTransitionException`
- message : `Transition from <current> to <next> is not allowed`
- prev : `<current>`
- attempt : `<next>`

The exception is generated inside the library, but in modern environments it should contain a stacktrace that allows you to track which line caused the exception.

<br>

### Requirements

`henderson` internally uses promises and expects an implementation to be available with `new Promise(function(resolve, reject) { ... })`. Otherwise, an environment providing ES5-support is enough (Array.indexOf and Array.reduce are used internally).

<br>

### Changelog

**2.0.0**

- #1 : fix buggy Promise chaining logic during state transitions, registered callbacks are run in strict order and the whole chain will be rejected if a callback returns a rejected promise
- #2 : `.on / .bind` supports registering both a single callback function and an array of callbacks

**1.0.0**

- initial release

<br>

### Colophon

The event emitter pattern that `henderson` uses at its core is based on [microevent.js](https://github.com/jeromeetienne/microevent.js).

<br>

### License

`henderson` is ISC licensed.

<br>

### Development

A basic development workflow is defined using npm run scripts. Get started with

```sh
$ git clone https://github.com/orbitbot/henderson
$ npm install
$ npm run develop
```

Bugfixes and improvements are welcome, however, please open an Issue to discuss any larger changes beforehand, and consider if functionality can be implemented with a simple monkey-patching extension script. Useful extensions are more than welcome!
