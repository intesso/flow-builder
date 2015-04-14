var Flow = require('flow-builder');
var flow = new Flow();

// define flow
flow
  .parallel('header', header)
  .parallel('footer', footer)
  .series('content', content);

// handle
var results = {};
flow
  .on('task', function(name, item, callback) {
    item.doSmartThing(results, function(err, result) {
      results.name = result;
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

