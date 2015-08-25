/**
 * Created by urielbertoche on 8/23/2015.
 */

var MAX_DISTANCE = 0.01;

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var stopSchema = new Schema({
  geo: {type: [Number], index: '2dsphere'},
  lines: [String],
  closeStops: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Stop'
  }]
});

stopSchema.methods.findNear = function (callback) {
  this.model('Stop').findOne({
    geo: {
      $nearSphere: this.geo,
      $maxDistance: MAX_DISTANCE
    }
  }, callback);
};

stopSchema.statics.getClosestStop = function (location, callback) {
  Stop.findOne({
    geo: {
      $nearSphere: location,
      $maxDistance: MAX_DISTANCE
    }
  }, callback);
};

stopSchema.methods.findClosestByLine = function (callback) {
  this.model('Stop').findOne({
    geo: {
      $nearSphere: this.geo,
      $maxDistance: MAX_DISTANCE
    },
    lines: {
      $contains: this.line[0]
    }
  }, callback);
};

var Stop = mongoose.model('Stop', stopSchema);

module.exports = Stop;