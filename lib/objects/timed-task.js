var util = require('util');
var EventEmitter = require('events').EventEmitter;

function TimedTask(max) {
  this.cursor = 0;
  this.max = max;

  EventEmitter.call(this);
}
util.inherits(TimedTask, EventEmitter);

TimedTask.prototype.tick = function() {
  this.cursor += 1;
  this.emit('tick', this.cursor);

  if (this.cursor === this.max) {
    this.emit('complete');
  }
};

TimedTask.prototype.getMaximum = function() {
  return this.max;
};

module.exports = TimedTask;
