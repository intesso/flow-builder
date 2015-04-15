var async = require('async.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var asyncMap = {
  each: 'each',
  parallel: 'each',
  sync: 'eachSeries',
  eachSync: 'eachSeries',
  eachSeries: 'eachSeries',
  series: 'eachSeries',
  eventually: 'each',
  long: 'each'
};

inherits(Flow, EventEmitter);
module.exports = Flow;
function Flow() {
  if (!(this instanceof  Flow)) return new Flow();
  this.setup();
}

/////////////////////
// flow definition //
/////////////////////
/**
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
  var args = [].slice.apply(arguments);
  this.prepend('eventually', args);
  return this;
};
Flow.prototype.long = Flow.prototype.eventually;

/**
 * these tasks will execute in the defined order.
 * the next task that was defined with series will be executed only after the previous one has finished.
 */
Flow.prototype.series = function() {
  var args = [].slice.apply(arguments);
  this.append('series', args);
  return this;
};
Flow.prototype.sync = Flow.prototype.series;
Flow.prototype.eachSync = Flow.prototype.series;

/**
 * these tasks will start their execution together.
 * if series tasks have been defined before, they will finish first.
 * after the defined `parallel` tasks in the same group
 */
Flow.prototype.parallel = function() {
  var args = [].slice.apply(arguments);
  this.append('parallel', args);
  return this;
};
Flow.prototype.each = Flow.prototype.parallel;

////////////////////
// flow execution //
////////////////////
/**
 * start the flow execution
 */
Flow.prototype.exec = function() {

  this.reset();
  this.emit('next');

  return this;
};

/**
 * called on every defined flow execution step (task)
 *
 * emits 'task', [args...,] callback
 *  - args arguments as they were defined with `series`, `parallel` or `eventually`.
 *  - callback(err)

 * @param step
 * @param cb(err)
 */
Flow.prototype.task = function(step, cb) {
  var self = this;
  if (this.err) return;

  var args = ['task'];
  args = args.concat(step[0]);
  args.push(cb);
  var listener = this.emit.apply(this, args);
  if (!listener) cb();
};

/**
 * called every time a defined group has finished
 * when the callback(err) is called with a `truthy` err, the flow is stopped and `done` err is emited.
 *
 * emits 'group', err, group, callback
 *  - err error
 *  - group definition as array [name, [steps...]]
 *  - callback(err)
 *
 * @param err error
 * @param group definition as array [name, [steps...]]
 */
Flow.prototype.group = function(err, group) {
  var self = this;
  if (this.err) return;

  var listener = this.emit('group', err, group, function(err) {
    evaluate(err);
  });
  if (!listener) evaluate(err);

  function evaluate(err) {
    if (err) return self.done(err);
    self.count++;
    // call done
    if (self.count >= self.length) return self.done();

    // call next
    if (self.first('eventually').same) {
      if ((self.count < self.length) && (group[0] !== 'eventually')) self.emit('next');
    } else {
      self.emit('next');
    }
  }

};

/**
 * called at the very end of the flow execution (final callback)
 *
 * emits 'done', err
 *  - err `truthy` when an error occured
 *
 * @param err `truthy` when an error occured
 */
Flow.prototype.done = function(err) {
  if (!this.err) this.emit('done', err);
  if (err) this.err = true;
};

//////////////////////////////
// private helper functions //
//////////////////////////////

Flow.prototype.setup = function() {
  var self = this;

  this.flow = [];

  this.removeAllListeners('next');
  this.on('next', function next() {
    self.index++;
    var group = self.flow[self.index];
    console.log('index', self.index, self.count);
    var name = group[0];
    var steps = group[1];

    async[asyncMap[name]](steps, self.task.bind(self), function callback(err) {
      self.group(err, group);
    });
    if (name == 'eventually') return next();

  });

  this.reset();
  return this;
};

Flow.prototype.reset = function() {
  this.index = -1;
  this.count = 0;
  this.length = this.flow.length;
  return this;
};

Flow.prototype.prepend = function(name, args) {
  var first = this.first(name);
  if (!first || !first.same) {
    this.flow.unshift([name, [[args]]]);
  } else {
    first.steps.push([args]);
  }
  return this;
};

Flow.prototype.append = function(name, args) {
  var previous = this.previous(name);
  if (!previous || !previous.same) {
    this.flow.push([name, [[args]]]);
  } else {
    previous.steps.push([args]);
  }
  return this;
};

Flow.prototype.first = function(name) {
  return this.element(name, 0);
};

Flow.prototype.previous = function(name) {
  return this.element(name, this.flow.length - 1);
};

Flow.prototype.element = function(name, i) {
  var flow = this.flow;
  var el = flow[i];
  if (!el) return null;
  var group = el[0];
  var steps = el[1];
  return {same: name === group, group: group, steps: steps};
};

