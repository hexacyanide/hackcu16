var async = require('async');
var Assignment = require('./assignment');
var TimedTask = require('./timed-task');

function AssignmentList(api, list) {
  this.api = api;
  this.list = list;
}

AssignmentList.prototype.getUUIDList = function() {
  return this.list;
};

AssignmentList.prototype.getKeyedMap = function(callback) {
  return this.getEntries(function(err, entries) {
    var map = {};
    for (var i = 0; i < entries.length; i++) {
      map[entries[i].getName()] = entries[i];
    }

    callback(err, map);
  });
};

AssignmentList.prototype.getEntries = function(callback) {
  var task = new TimedTask(this.list.length);
  var transform = (uuid, fn) => {
    this.api.getAssignment(uuid, function(err, meta) {
      var as = new Assignment(uuid, meta);
      fn(err, as);
      task.tick();
    });
  };

  async.map(this.list, transform, callback);
  return task;
};

module.exports = AssignmentList;
