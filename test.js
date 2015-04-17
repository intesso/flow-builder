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

test('flow iteration with forEach', function(t) {
  t.plan(7);

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
  flow.forEach(function(name, task, stepIndex, groupName, groupIndex) {
    t.true(
      typeof task.doSmartThing === 'function' &&
      typeof name === 'string' &&
      typeof stepIndex === 'number' &&
      typeof groupName === 'string' &&
      typeof  groupIndex === 'number'
    );
  });

});

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


test('flow task error', function(t) {
  t.plan(5);

  var flow = new Flow();
  // define flow
  flow
    .eventually('0a', task('0a'))
    .parallel('1a', task('1a'))
    .series('2a', task('2a'))
  ;

  // handle flow events
  var results = {};
  flow
    .on('task', function(name, item, callback) {
      item.doSmartThing(results, function(err, result) {
        t.true(result);
        if (result === '1a') return callback('1a error');
        results[result] = result + ' DONE';
        callback(err);
      });
    })
    .on('group', function(err, group, callback) {
      console.log('group finished', err, group);
      t.true(!err || '1a error');
      callback(err);
    })
    .on('done', function(err) {
      t.true(err);
      if (err) return console.log('failed');
      console.log('all done', results);
    });

  // start flow
  flow.exec();

});


test('flow group error', function(t) {
  t.plan(6);

  var flow = new Flow();
  // define flow
  flow
    .eventually('0a', task('0a'))
    .series('2a', task('2a'))
    .series('2b', task('2b'))
    .parallel('1a', task('1a'))

  ;

  // handle flow events
  var results = {};
  flow
    .on('task', function(name, item, callback) {
      item.doSmartThing(results, function(err, result) {
        t.true(result);
        if (result === '2b') return callback('2b error');
        results[result] = result + ' DONE';
        callback(err);
      });
    })
    .on('group', function(err, group, callback) {
      console.log('group finished', err, group);
      t.true(!err || '2b error');
      callback(err);
    })
    .on('done', function(err) {
      t.true(err);
      if (err) return console.log('failed');
      console.log('all done', results);
    });

  // start flow
  flow.exec();

});



