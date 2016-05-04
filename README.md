# henderson
> A tiny event emitter-based finite state machine, with promises

[![Build Status](https://travis-ci.org/orbitbot/henderson.svg?branch=master)](https://travis-ci.org/orbitbot/henderson)
![Uncompressed size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.js?color=red)
![minfied size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.min.js?color=yellow&label=minfied size)
![minfied+gzipped size](https://badge-size.herokuapp.com/orbitbot/henderson/master/henderson.min.js?label=gzipped.min&compression=gzip)

`henderson` is the promise-based version of [`pastafarian`](https://github.com/orbitbot/pastafarian).

###### Features
- small size
- simple but powerful API
- works without dependencies on modern browsers (see requirements)

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
  .on('end', function(param) {
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

state.reset = state.go.bind('end');
state.reset('foo');
```

### Installation

Right click to save or use the URLs in your script tags

- [`henderson.js`](https://cdn.rawgit.com/orbitbot/henderson/master/henderson.js)
- [`henderson.min.js`](https://cdn.rawgit.com/orbitbot/henderson/master/henderson.min.js)

or use

```sh
$ npm install henderson
```

If you're using `henderson` in a browser environment, the constructor is attached to the `StateMachine` global.

<br>

### Usage

`henderson` is very similar in usage to [`pastafarian`](https://github.com/orbitbot/pastafarian) and most of the documentation in that project can be directly applied to `henderson` as well.

##### Differences to `pastafarian



<br>

##### Error handling

###### IllegalTransitionException

`henderson` defines a custom exception which is generated when the transitions array of the current state doesn't contain the state passed to `fsm.go`:

- name: `IllegalTransitionException`
- message: `Transition from <current> to <next> is not allowed`

The exception is generated inside the library, but in modern environments it should contain a stacktrace that allows you to track which line caused the exception.

<br>

<br>

### Colophon

The event emitter pattern that `pastafarian` uses at its core is based on [microevent.js](https://github.com/jeromeetienne/microevent.js).

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
