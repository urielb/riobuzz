/**
 * Created by urielbertoche on 12/7/2016.
 */

var Stop = require("../models/stop");

var geo = require('../lib/geo');
var config = require('../../config/settings');

var methods = {};

function findNearStops (coordinates) {
  var stopKeys = Object.keys(global.stops);
  var nearStops = [];

  coordinates = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

  for (var i = 0; i < stopKeys.length; i++) {
    var stop = global.stops[stopKeys[i]];
    /**
     * if close enough, add to nearStops array
     */
    var dist = geo.calculateDistance(coordinates, stop.geo, 'm');
    if (dist < config.MAX_STOP_DISTANCE) {
      nearStops.push(stop);
    }
  }

  return nearStops;
}

function concatLines (stops) {
  var lines = []; // destinationNearStops
  for (var i = 0; i < stops.length; i ++) {
    var stop = stops[i];
    for (var j = 0; j < stop.lines.length; j++) {
      if (lines.indexOf(stop.lines[j]) == -1)
        lines.push(stop.lines[j]);
    }
  }

  return lines;
}

//function matchDirectLines (originStops, destinationStops) {
//  var matchingLines = [];
//
//  for (var i = 0; i < originStops.length; i++) {
//    var stopO = originStops[i];
//    console.log(stopO);
//
//    for (var j = 0; j < stopO.lines.length; j++) {
//      var lineNumber = stopO.lines[j];
//      var line = global.lines[lineNumber];
//      var stop = undefined;
//
//      if (line != undefined) {
//        var lineStopsKeys = Object.keys(line.stops);
//        for (var u = 0; u < lineStopsKeys.length; u++) {
//          var lsKey = lineStopsKeys[u];
//          if (lsKey.indexOf(stopO.geo[0] + "" + stopO.geo[1]) != -1)
//            stop
//        }
//      }
//    }
//  }
//
//  return matchingLines;
//}

methods.findRoutes = function (origin, destination) {
  console.log(origin, destination);
  var originNearStops = findNearStops(origin);
  var destinationNearStops = findNearStops(destination);

  console.log("originNearStops", originNearStops.length);
  console.log("destinationNearStops", destinationNearStops.length);

  // console.log(destinationNearStops);

  //var destinationLines = concatLines(destinationNearStops);
  //var originLines = concatLines(originNearStops);

  //console.log(originLines);
  //console.log(destinationLines);

  //var directLines = matchDirectLines(originNearStops, destinationNearStops);
  //console.log(directLines);
};

module.exports = methods;