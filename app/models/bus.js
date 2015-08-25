/**
 * Created by urielbertoche on 8/23/2015.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var lineSchema = new Schema({
  routePoints: [{ type: [Number], index: '2dsphere' }],
  stops: [{ type: [Number], index: '2dsphere' }],
  description: String,
  name: String
});