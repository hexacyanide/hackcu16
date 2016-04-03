var async = require('async');
var Assignment = require('./assignment');

function AssignmentList(api, list) {
  this.api = api;
  this.list = list;
}

AssignmentList.prototype.getUUIDList = function() {
  return this.list;
};

AssignmentList.prototype.getNamedList = function(callback) {
  this.getEntries(function(err, entries) {
    var names = [];
    for (var i = 0; i < entries.length; i++) {
      names.push(entries[i].getName());
    }
    callback(err, names);
  });
};

AssignmentList.prototype.getEntries = function(callback) {
  // async.map(this.list, this.api.getAssignment.bind(this.api), callback);
  var transform = (uuid, fn) => {
    this.api.getAssignment(uuid, function(err, meta) {
      var as = new Assignment(uuid, meta);
      fn(err, as);
    });
  };

  async.map(this.list, transform, callback);
};

module.exports = AssignmentList;

