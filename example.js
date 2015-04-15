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
      results[result] = result + ' :: DONE';
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
