var request = require('request');

exports.getToken = function(options, callback) {
  var opts = {
    url: 'https://api-cog-csci' + options.course + '.cs.colorado.edu/my/token/',
    headers: { 'Authorization': generateAuth(options.identikey, options.password) }
  };

  request(opts, function(err, res, body) {
    if (err || res.statusCode !== 200) {
      callback(err || res.statusCode);
      return;
    }

    callback(null, JSON.parse(body).token);
  });
};

function generateAuth(username, password) {
  var token = new Buffer(username + ':' + password);
  return 'Basic ' + token.toString('base64');
}
