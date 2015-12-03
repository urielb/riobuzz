/**
 * Created by urielbertoche on 12/3/2015.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var stopSchema = new Schema({
  geo: {type: [Number], index: '2dsphere'},
  lines: [String],
  closeStops: [{type: mongoose.Schema.Types.ObjectId, ref: 'Stop'}]
});

/**
 * Return nearest stop to this one
 * @param callback
 */
stopSchema.methods.getNearest = function (callback) {
  this.model('Stop').findOne({geo: { $nearSphere: this.geo, $maxDistance: 0.01} }, function (err, doc) {
    callback(err, doc);
  });
};

/**
 * Return nearest stop to a given coordinate
 * @param coordinate
 * @param callback
 */
stopSchema.statics.getNearest = function (coordinate, callback) {
  this.model('Stop').findOne({geo: { $nearSphere: coordinate, $maxDistance: 0.01}}, function (err, doc) {
    callback(err, doc);
  });
};

var Stop = mongoose.model('Stop', stopSchema);

module.exports = Stop;