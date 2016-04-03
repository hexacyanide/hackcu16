var request = require('request');
var debug = require('debug')('cog-cli:api');

function COG(token, course) {
  this.token = token;
  this.apiUrl = 'https://api-cog-csci' + course + '.cs.colorado.edu/';
}

COG.prototype._request = function(options, callback) {
  var genAuthHeader = function(tok) {
    return 'Basic ' + new Buffer(tok + ':').toString('base64');
  };

  options.baseUrl = this.apiUrl;
  options.headers = { 'Authorization': genAuthHeader(this.token) };
  return request(options, callback);
};

COG.prototype._getJSON = function(options, callback) {
  this._request(options, function(err, res, body) {
    // propagate library and core errors
    if (err) {
      callback(err);
      return;
    }

    // handle non-expected server responses
    if (res.statusCode !== 200) {
      callback(new Error('Received status ' + res.statusCode + ' from server'));
      return;
    }

    // expect JSON from the server, but handle if it is not
    try {
      var json = JSON.parse(body);
    } catch (e) {
      callback(e);
      return;
    }

    callback(null, json);
  });
};

COG.prototype._getPropJSON = function(options, callback) {
  var prop = options.prop;
  delete options.prop;

  this._getJSON(options, function(err, obj) {
    if (err) return callback(err);
    // extract a property if it is specified
    callback(null, (prop ? obj[prop] : obj));
  });
};

var AssignmentList = require('./objects/assignment-list');

COG.prototype.getAssignments = function(callback) {
  var self = this;
  this._getPropJSON({
    url: '/assignments',
    prop: 'assignments'
  }, function(err, list) {
    callback(err, new AssignmentList(self, list));
  });
};

COG.prototype.getAssignmentsSubmittable = function(callback) {
  debug('request involved for submittable assignments');
  var self = this;
  this._getPropJSON({
    url: '/assignments/submitable',
    prop: 'assignments'
  }, function(err, list) {
    callback(err, new AssignmentList(self, list));
  });
};

COG.prototype.getAssignment = function(uuid, callback) {
  debug('requesting metadata for assignment %s', uuid.substring(0, 8));
  this._getPropJSON({
    url: '/assignments/' + uuid,
    prop: uuid
  }, function(err, meta) {
    debug('received metadata for assignment %s', uuid.substring(0, 8));
    callback(err, meta);
  });
};

COG.prototype.getAssignmentTests = function(uuid, callback) {
  this._getPropJSON({
    url: '/assignments/' + uuid + '/tests',
    prop: 'tests'
  }, callback);
};

COG.prototype.createAssignmentSubmission = function(uuid, callback) {

};

COG.prototype.getAssignmentSubmission = function(uuid) {
  this._getPropJSON({
    url: '/assignments/' + uuid + '/submissions',
    prop: null
  }, callback);
};

COG.prototype.getFile = function() {
};

COG.prototype.getFileContents = function() {
};

COG.prototype.getMyAssignmentSubmission = function(uuid, callback) {
  this._getPropJSON({
    url: '/my/assignments/' + uuid + '/submissions',
    prop: null
  }, callback);
};

COG.prototype.getMySubmissionRun = function(uuid, callback) {
  this._getPropJSON({
    url: '/my/submissions/' + uuid + '/runs',
    prop: null
  }, callback);
};

COG.prototype.addSubmissionFiles = function() {
};

COG.prototype.getSubmission = function(uuid, callback) {
  this._getPropJSON({
    url: '/submissions/' + uuid,
    prop: null
  }, callback);
};

COG.prototype.getSubmissionFiles = function(uuid, callback) {
  this._getPropJSON({
    url: '/submissions/' + uuid + '/files',
    prop: null
  }, callback);
};

COG.prototype.getSubmissionTest = function(uuid, callback) {
  this._getPropJSON({
    url: '/submissions/' + uuid + '/runs',
    prop: null
  }, callback);
};

COG.prototype.getSubmissions = function() {
};

COG.prototype.runSubmissionTest = function() {
};

COG.prototype.getTest = function(uuid, callback) {
  this._getPropJSON({
    url: '/tests/' + uuid,
    prop: null
  }, callback);
};

COG.prototype.getRun = function(uuid, callback) {
  this._getPropJSON({
    url: '/runs/' + uuid,
    prop: null
  }, callback);
};

module.exports = COG;
