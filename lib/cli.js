const program = require('commander');
const prompt = require('./prompt');
const submit = require('./submit');

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
    submit(files);
  });

program
  .command('*')
  .action(function(){
    program.outputHelp();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
