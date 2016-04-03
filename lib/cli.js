const prompt = require('./prompt');
const program = require('commander');

program.version('0.0.1');

program
  .command('login')
  .description('sign in with a user account')
  .action(function() {
    prompt.authDialogue();
  });

program
  .command('logout')
  .description('log out of the current account')
  .action(function() {
    prompt.logout();
  });

program
  .command('submit [files...]')
  .description('submit files to the grading server')
  .action(function(files) {
    console.log(files);
  });

program.parse(process.argv);
