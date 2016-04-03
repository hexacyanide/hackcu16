var Rx = require('rx');
var inquirer = require('inquirer');
var debug = require('debug')('cog-cli:prompt');
var ProgressBar = require('progress');

var COG = require('./cog-api');
var login = require('./login');
var store = new (require('./keystore'))();

function assignmentPrompt(token, course) {
  var cog = new COG(token, course);
  cog.getAssignmentsSubmittable(function(err, list) {
    var reqs = list.getKeyedMap(function(err, map) {
      var names = Object.keys(map);
      names.sort();

      var prompts = Rx.Observable.create(function(obs) {
        obs.onNext({
          type: 'list',
          name: 'assignment',
          message: 'Choose Assignment:',
          choices: names
        });

        obs.onCompleted();
      });

      inquirer.prompt(prompts, function(answers) {
        // overwrite all existing information
        store.set('token', token);
        store.set('course', course);
        store.set('assignment', map[answers.assignment].getUUID());
        store.save();
      });
    });

    var bar = new ProgressBar('  downloading assignments  [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: reqs.getMaximum(),
      clear: true
    });

    reqs.on('tick', function(cursor) {
      bar.tick(cursor);
    });
  });
}

debug('initalizing prompt for user credentials and course identifier');

// sign in for token retrieval
inquirer.prompt([
  {
    type: 'input',
    name: 'identikey',
    message: 'CU IdentiKey:',
    validate: function(input) {
      if (input.match(/^[a-z0-9]+$/i)) {
        return true;
      }

      return 'Please enter a valid IdentiKey';
    }
  },
  {
    type: 'password',
    name: 'password',
    message: 'Password:',
    validate: function(input) {
      if (input.length > 0) return true;
      return 'Please enter a password';
    }
  },
  {
    type: 'input',
    name: 'course',
    message: 'Course:',
    validate: function(input) {
      if (input.match(/^[0-9]{4}$/)) {
        return true;
      }

      return 'Course identifiers must consist of four digits';
    }
  }
], function(answers) {
  debug('all user inputs received, attempting to sign in to course %d', answers.course);

  login.getToken(answers, function(err, token) {
    if (err) {
      if (err.code === 'ENOTFOUND') {
        debug('failed to find COG server for given course code');
        return;
      }

      debug('user authentication failed with error code: %s', err.code);
      return;
    }

    debug('successful sign on, assigned token %s', token.substring(0, 8));
    assignmentPrompt(token, answers.course);
  });
});
