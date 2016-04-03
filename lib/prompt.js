var Rx = require('rx');
var inquirer = require('inquirer');

var COG = require('./cog-api2');
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

// sign in for token retrieval
inquirer.prompt([
  {
    type: 'input',
    name: 'identikey',
    message: 'CU IdentiKey:'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Password:'
  },
  {
    type: 'input',
    name: 'course',
    message: 'Course:'
  }
], function(answers) {
  login.getToken(answers, function(err, token) {
    if (err) {
      console.log('Failed to sign on: %s', err);
      return;
    }

    console.log('Signed on with token %s', token);
    assignmentPrompt(token, answers.course);
  });
});
