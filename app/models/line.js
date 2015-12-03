/**
 * Created by urielbertoche on 12/3/2015.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var lineSchema = new Schema({
  line: String,
  description: String,
  agency: String,
  stops: [{
    geo: {type: [Number], index: '2dsphere'},
    order: Number,
    trip: Number
  }]
});

var Line = mongoose.model('Line', lineSchema);

module.exports = Line;