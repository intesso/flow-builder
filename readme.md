# flow-builder

define and execute tasks in a simple way.



## flow definition

```js
/**
 *
 * the flow is basically executed in the defined order (fifo).
 * flow groups are created automatically, depending on your definition.
 *  - all `eventually` tasks will be in the same group: started immediately, and evaluated at the final callback (done).
 *  - `series` tasks added in a row will create a new `series` group.
 *  - `parallel` tasks that are added in a row will create a new `parallel group.
 *
 *  when ever you add a different task e.g. `parallel` after `series` or vice versa, a new group is being created automatically.
 *  the next group is only started after the previous group has finished.
 *
 */

/**
 * these tasks will be started immediately and evaluated only at the final callback (done),
 * when the whole task flow has finished.
 */
Flow.prototype.eventually = function() {

};

/**
 * these tasks will execute in the defined order.
 * the next task that was defined with series will be executed only after the previous one has finished.
 */
Flow.prototype.series = function() {

};

/**
 * these tasks will start their execution together.
 * if series tasks have been defined before, they will finish first.
 * after the defined `parallel` tasks in the same group
 */
Flow.prototype.parallel = function () {

};
```

## flow execution

### start task flow

```js

/**
 * start the flow execution
 */
Flow.prototype.exec = function () {

};

### callback functions (events)

/**
 * called on every defined flow execution step (task)
 *
 * @param cb(args, done)
 */
Flow.prototype.task = function(cb) {

};

/**
 * called every time a defined group has finished
 *
 * @param cb(result, done)
 */
Flow.prototype.group = function(cb) {

};

/**
 * called at the very end of the flow execution (final callback)
 *
 * @param cb(err, result)
 */
Flow.prototype.done = function(cb) {

};

```