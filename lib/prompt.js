var Rx = require('rx');
var inquirer = require('inquirer');
var debug = require('debug')('cog-cli:prompt');

var COG = require('./cog-api');
var login = require('./login');

function assignmentPrompt(token, course) {
  var prompts = Rx.Observable.create(function(obs) {
    var cog = new COG(token, course);

    cog.getAssignmentsSubmittable(function(err, list) {
      list.getNamedList(function(err, names) {
        names.sort();

        obs.onNext({
          type: 'list',
          name: 'assignment',
          message: 'Assignment:',
          choices: names
        });

        obs.onCompleted();
      });
    });
  });

  inquirer.prompt(prompts, function(answers) {
    console.log(answers);
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
