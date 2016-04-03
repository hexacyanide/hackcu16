var fs = require('fs');
var path = require('path');
var async = require('async');
var colors = require('colors');
var archiver = require('archiver');
var inquirer = require('inquirer');

var cwd = process.cwd();
var store = new (require('./keystore'))();

var token = store.get('token');
var course = store.get('course');
var cog = new (require('./cog-api'))(token, course);

var ZipFile = require('./zipfile');

function Submit(files) {
  this.files = files.map(function(file) {
    return path.resolve(cwd, file);
  });

  checkFiles(this.files, function(err) {
    if (err) {
      switch (err.code) {
        case 'ENOENT':
          console.log(colors.cyan('[COG-S] ') + colors.red('File does not exist at path (%s)'), err.path);
          break;
        case 'EISDIR':
          console.log(colors.cyan('[COG-S] ') + colors.red('Cannot submit directories (%s)'), err.path);
          break;
        default:
      }

      console.log(colors.cyan('[COG-S] ') + colors.red('Please review the list of files you would like to submit'));
      return;
    }

    console.log(colors.cyan('[COG-S] ') + colors.blue('All specified files passed verification'));
    // console.log(colors.cyan('[COG-S] ') + colors.blue('Using: ' + JSON.stringify(files)));

    if (files.length === 1) {
      var path = this.files[0];
      console.log(colors.cyan('[COG-S] ') + colors.blue('Submitting single file: ') + colors.grey(files[0]));

      cog.uploadFile(path, function(err, res, body) {
        console.log(err, res, body);
      }, path.substr(-4) === '.zip');

      return;
    }

    console.log(colors.cyan('[COG-S] ') + colors.blue('Creating archive with files: ' + JSON.stringify(files)));
    var zip = new ZipFile();
    zip.addFiles(this.files);

    var stream = zip.save();
    inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Name File (no .zip):',
        validate: function(input) {
          if (input.match(/^[a-z0-9-_]+$/i)) {
            return true;
          }

          return 'File names can only contain numbers, letters, underscores and dashes';
        }
      }
    ], function(answers) {
      var tmp = './' + answers.filename + '.zip';
      stream.pipe(fs.createWriteStream(tmp));
      stream.on('end', function() {
        cog.uploadFile(tmp, function(err, res, body) {
          fs.unlink(tmp, function(er) {
            console.log(err, res, body);
          });
        }, true);
      });
    });
  });
}

function checkFiles(files, fn) {
  async.map(this.files, function(path, fn) {
    fs.lstat(path, function(err, stats) {
      if (err) {
        fn(err);
        return;
      }

      if (stats.isDirectory()) {
        var e = new Error('Directory submissions are not supported');
        e.code = 'EISDIR';
        e.path = path;
        fn(e);
        return;
      }

      fn(err, stats);
    });
  }, function(err, results) {
    fn(err);
  });
}

module.exports = Submit;
