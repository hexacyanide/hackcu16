function Assignment(uuid, meta) {
  this.uuid = uuid;
  this.meta = meta;
}

Assignment.prototype.getName = function() {
  return this.meta.name;
};

Assignment.prototype.getUUID = function() {
  return this.uuid;
};

module.exports = Assignment;
