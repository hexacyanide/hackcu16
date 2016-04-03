var request = require('request');

exports.getToken = function(options, callback) {
  var opts = {
    url: 'https://api-cog-csci' + options.course + '.cs.colorado.edu/my/token/',
    headers: { 'Authorization': generateAuth(options.identikey, options.password) }
  };

  request(opts, function(err, res, body) {
    // handle all general errors
    if (err) {
      callback(err);
      return;
    }

    // handle unexpected server responses
    if (res.statusCode !== 200) {
      var e = new Error('Received non-successful HTTP %d', res.statusCode);
      callback(e);
      return;
    }

    callback(null, JSON.parse(body).token);
  });
};

function generateAuth(username, password) {
  var token = new Buffer(username + ':' + password);
  return 'Basic ' + token.toString('base64');
}
