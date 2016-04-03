const fs = require('fs');
const path = require('path');
const debug = require('debug')('cog-cli:keystore');
const root = path.join(process.env['HOME'], '.cog');
const file = path.join(root, 'store.json');

function KeyStore() {
  this.map = {};
}

KeyStore.prototype.set = function(k, v) {
  debug('setting key %s to value %s', k, v);
  this.map[k] = v;
};

KeyStore.prototype.get = function(k) {
  return this.map[k];
};

KeyStore.prototype.save = function() {
  var str = JSON.stringify(this.map);
  debug('stringifying key-value store');
  try {
    debug('attempting to create storage directory in home');
    fs.mkdirSync(root);
  } catch (e) {
    debug('storage directly already exists');
  }

  fs.writeFileSync(file, str);
  debug('data successfully written to disk');
};

KeyStore.prototype.load = function() {
  debug('attempting to load keyfile from disk');
  try {
    this.map = require(file);
  } catch (e) {
    debug('nonexistent or malformed keystore file, starting empty');
    this.map = {};
  }
};

module.exports = KeyStore;
