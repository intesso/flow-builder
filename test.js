var Flow = require('./index');
var flow = new Flow();


var projectHistory = [];
function task(todo) {
  return {
    doSmartThing: function(list, callback) {
      projectHistory.push(todo);
      callback(null, todo);
    }
  }
}


// define flow
flow
  .parallel('header', task('HEADER'))
  .parallel('footer', task('FOOTER'))
  .series('content', task('CONTENT'));

// handle
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

flow.exec();

