var test = require('tape');
var Flow = require('./index');

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

test('basic flow', function(t) {
  t.plan(6);

  var flow = new Flow();
  // define flow
  flow
    .parallel('header', task('ADD A HEADER'))
    .parallel('footer', task('ADD A FOOTER'))
    .series('content', task('ENTER CONTENT'))
  ;

  // handle flow events
  var results = {};
  flow
    .on('task', function(name, item, callback) {
      item.doSmartThing(results, function(err, result) {
        results[result] = result + ' DONE';
        t.true(result);
        callback(err);
      });
    })
    .on('group', function(err, group, callback) {
      console.log('group finished', group);
      t.false(err);
      callback(err);
    })
    .on('done', function(err) {
      t.false(err);
      if (err) return console.log('failed');
      console.log('all done', results);
    });

  // start flow
  flow.exec();

});

test('extended flow', function(t) {
  t.plan(9);

  var flow = new Flow();
  // define flow
  flow
    .parallel('header', task('ADD A HEADER'))
    .parallel('footer', task('ADD A FOOTER'))
    .series('content', task('ENTER CONTENT'))
    .eventually('news', task('COLLECT NEWS'))
    .eventually('social', task('BE SOCIAL'))
  ;

  // handle flow events
  var results = {};
  flow
    .on('task', function(name, item, callback) {
      item.doSmartThing(results, function(err, result) {
        results[result] = result + ' DONE';
        t.true(result);
        callback(err);
      });
    })
    .on('group', function(err, group, callback) {
      console.log('group finished', group);
      t.false(err);
      callback(err);
    })
    .on('done', function(err) {
      t.false(err);
      if (err) return console.log('failed');
      console.log('all done', results);
    });

  // start flow
  flow.exec();

});

test('flow glow', function(t) {
  t.plan(12);

  var flow = new Flow();
  // define flow
  flow
    .eventually('0a', task('0a'))
    .parallel('1a', task('1a'))
    .parallel('1b', task('1b'))
    .series('2a', task('2a'))
    .series('2b', task('2b'))
    .parallel('3a', task('3a'))
    .eventually('0b', task('0b'))
  ;

  // handle flow events
  var results = {};
  flow
    .on('task', function(name, item, callback) {
      item.doSmartThing(results, function(err, result) {
        results[result] = result + ' DONE';
        t.true(result);
        callback(err);
      });
    })
    .on('group', function(err, group, callback) {
      console.log('group finished', group);
      t.false(err);
      callback(err);
    })
    .on('done', function(err) {
      t.false(err);
      if (err) return console.log('failed');
      console.log('all done', results);
    });

  // start flow
  flow.exec();

});



