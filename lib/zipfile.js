var fs = require('fs');
var path = require('path');
var archiver = require('archiver');

function ZipFile() {
  this.archive = archiver.create('zip', {});
}

ZipFile.prototype.addFiles = function(paths) {
  paths.forEach((filepath) => {
    this.addFile(filepath);
  });
};

ZipFile.prototype.addFile = function(filepath) {
  var res = fs.createReadStream(filepath);
  var name = path.basename(filepath);
  this.archive.append(res, { name });
};

ZipFile.prototype.save = function() {
  this.archive.finalize();
  return this.archive;
};

module.exports = ZipFile;
