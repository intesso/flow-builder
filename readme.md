# flow-builder

define and execute tasks in a simple way.

#### what is it good for

`flow-builder` lets you define a work flow that works well with tasks with a defined API.
it gives you a simple building block to handle tasks that depend on other tasks.
tasks will most likely be asynchronous, but it can be used for synchronous tasks as well.

#### when not to use it

whenever your tasks don't have a unified API (function name and function signature).


# install

```bash
npm install flow-builder
```


# use

## example

```js


var Flow = require('flow-builder');
var flow = new Flow();

// define flow
flow
  .parallel('header', task('ADD A HEADER'))
  .parallel('footer', task('ADD A FOOTER'))
  .series('content', task('ENTER CONTENT'));

// handle flow events
var results = {};
flow
  .on('task', function(name, item, callback) {
    item.doSmartThing(results, function(err, result) {
      results[result] = result + ' DONE';
      callback(err);
    });
  })
  .on('group', function(err, group, callback) {
    console.log('group finished', group);
    callback(err);
  })
  .on('done', function(err) {
    if (err) return console.log('failed');
    console.log('all done', results);
  });

// start flow
flow.exec();


// example task
var projectHistory = [];
function task(todo) {
  return {
    doSmartThing: function(list, callback) {
      projectHistory.push(todo);
      callback(null, todo);
    }
  }
}
```


## flow definition

the flow is basically executed in the order the definition methods are called.

__automatic group creation__
 * flow groups are created automatically, depending on your definition.
 *  - all `eventually` tasks will be in the same group: started immediately, and evaluated at the final callback (done).
 *  - `series` tasks added in a row will create a new `series` group.
 *  - `parallel` tasks that are added in a row will create a new `parallel group.
 *
 *  when ever you add a different task e.g. `parallel` after `series` or vice versa, a new group is being created automatically.
 *  the next group is only started after the previous group has finished.

__arguments__
the flow definition methods take any and as many arguments as you like.
the provided arguments will be emitted in the `task` event, to let you handle the task execution.
the only thing to consider is, that the arguments should be consistent in every definition method for the same `flow`.

the methods return this and are chainable.

### methods

#### series([args..])

aliases: `eachSeries`, `eachSync`, `sync`

these tasks will execute in the defined order.
the next task that was defined with series will be executed only after the previous one has finished.

#### parallel([args..])

aliases: `each`

these tasks will start their execution together.
if series tasks have been defined before, they will finish first.
after the defined `parallel` tasks in the same group

#### eventually([args..])

aliases: `long`

these tasks will be started immediately and evaluated only at the final callback (done),
when the whole task flow has finished.


## flow execution method

#### exec()

start the flow execution

## events

#### task

called on every defined flow execution step (task)
call the callback function when the task is done `callback()` or when an error occured `callback(err)`.

arguments: `[args...,]` `callback`
 *  `args` arguments as they were defined with `series`, `parallel` or `eventually`.
 *  `callback(err)`

#### group

called every time a defined group has finished
call the callback function when the task is done `callback()` or when an error occured `callback(err)`.
when the `callback(err)` is called with a `truthy` err, the flow is stopped and `done` err is emited.

arguments:  `err`, `group`, `callback`
 *  `err` error
 *  `group` definition as array [name, [steps...]] where steps are the defined arguments
 *  `callback(err)`

#### done

called at the very end of the flow execution (final callback)

arguments: `err`
 *  `err` `truthy` when an error occured


# test
```bash
npm test
```

# license
MIT