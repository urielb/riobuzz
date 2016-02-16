/**
 * Created by urielbertoche on 12/3/2015.
 */

var fs = require('fs');
var csv_parser = require('csv-parse');
var request = require('request');
var ProgressBar = require('progress');

var geo = require('../lib/geo');
var config = require('../../config/settings');

var url_all_stops_csv = "http://dadosabertos.rio.rj.gov.br/apiTransporte/Apresentacao/csv/gtfs/onibus/paradas/gtfs_todas-linhas-paradas.csv";
var localStopsFile = 'resources/gtfs_todas-linhas-paradas.csv';

var methods = {};

function csv2json(csv, callback) {
  try {
    csv = csv.split('\r').join('');
    csv_parser(csv, {
      columns: true,
      rowDelimiter: '\n',
      delimiter: ',',
      skip_empty_lines: true
    }, function (err, output) {
      callback(err, output)
    });

  } catch (e) {
    throw (e);
    callback (e, undefined);
  }
}

function downloadCSV(callback) {
  request(url_all_stops_csv, function (error, response, body) {
    if (error) throw error;

    console.log("Done downloading CSV file.");
    console.log("Writing file...");

    fs.open(localStopsFile, 'w', function(err, fd) {
      if (err) throw err;

      fs.write(fd, body, function (err, written, string) {
        console.log("Done writing file.");
        callback(err, string);
      });
    });
  });
}

function getCSVData(callback) {
  console.log("Reading CSV file.");

  fs.readFile(localStopsFile, 'utf8', function (err, data) {
    if (err) {
      console.log("Doesn't exits. Downloading...");
      downloadCSV(function (err, string) {
        callback(err, string);
      });
    } else {
      console.log("Exists. Returning data...");
      callback(err, data);
    }
  });
}

/**
 * Method that loads the CSV with all stops data into memory
 * @param callback
 */
methods.loadStopsCSV = function (callback) {
  getCSVData(function (err, data) {
    if (err) callback(err, undefined);
    console.log("Done reading CSV file.");
    console.log("Started parsing CSV.");
    csv2json(data, function (err, output) {
      console.log("Finished parsing CSV.");
      callback(err, output);
    });
  });
};

/**
 * Method to change the structure of the json returned by loadStopsCSV
 * @param callback
 */
methods.processStops = function (callback) {
  var stops = {};
  var lines = {};
  console.log("Processing Stops...");

  methods.loadStopsCSV(function (err, output) {
    if (err) callback(err, {}, {});
    else {
      for (var i = 0; i < output.length; i++) {
        var stop = output[i];
        stop.latitude = parseFloat(stop.latitude);
        stop.longitude = parseFloat(stop.longitude);

        var hashStop = stop.latitude + "" + stop.longitude + "(" + stop.sequencia + ")";

        // Set up lines
        var lineStop = {
          geo: [stop.latitude, stop.longitude],
          order: stop.sequencia,
          trip: -1
        };

        if (lines[stop.linha] != undefined) {
          lines[stop.linha].stops[hashStop] = lineStop;
          //lines[stop.linha].stops.push(lineStop);
        } else {
          lines[stop.linha] = {
            line: stop.linha,
            description: stop.descricao,
            agency: stop.agencia,
            // stops: [lineStop]
            stops: {}
          };

          lines[stop.linha].stops[hashStop] = lineStop;
        }

        // Set up stops
        if (stops[hashStop] !== undefined) {
          if (stops[hashStop].lines.indexOf(stop.linha) == -1) {
            stops[hashStop].lines.push(stop.linha);
          }
        } else {
          stops[hashStop] = {
            geo: [stop.latitude, stop.longitude],
            lines: [],
            closeStops: []
          };
        }
      }

      global.lines = lines;
      global.stops = stops;

      console.log("Finished processing stops.");
      callback(err, lines, stops);
    }
  });
};

/**
 * Method used to process stops data on nearStops, invokes callback passing parameters (err, stops)
 * err: error
 * stops: stops object with updated information on nearStops
 * @param callback
 */
methods.processNearStops = function (callback) {
  var stopHashArray = Object.keys(global.stops);
  console.log("Processing near stops");
  console.log();

  var bar = new ProgressBar('  processing [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 100,
    total: stopHashArray.length
  });

  for (var i = 0; i < stopHashArray.length; i++) {
    var stop = global.stops[stopHashArray[i]];
    bar.tick(1);
    if (bar.complete) {
      console.log('\ncomplete\n');
    }

    for (var j = 0; j < stopHashArray.length; j++) {
      if (i != j) {
        var secondStop = global.stops[stopHashArray[j]];
        var distance = geo.calculateDistance(stop.geo, secondStop.geo, 'm');
        if (distance <= config.DISTANCE_CLOSE_STOPS) {
          stop.closeStops.push({
            geo: secondStop.geo
          });
        }
      }
    }
  }

  console.log("Finished processing near stops");
  callback();
};

methods.processLineStopsSequency = function (lines, callback) {
  console.log("Redoing lines stops sequency");

  var processedLines = {};

  if (lines instanceof Function) {
    callback = lines;
    lines = Object.keys(global.lines);
  } else if (lines instanceof Array) {
    lines = lines;
  } else if (lines instanceof Object) {
    lines = Object.keys(lines);
  } else if (typeof lines === "string" && lines != "") {
    var pattern = "[^\\d,]",
        re = new RegExp(pattern, "g");
    lines = lines.replace(re, "");
    lines = lines.split(",");
    while(lines.indexOf("") >= 0) lines.splice(lines.indexOf(""), 1);
  } else {
    lines = Object.keys(global.lines);
  }

  for (var i = 0; i < lines.length; i++) {
    var line = global.lines[lines[i]];
    var stops = {};

    var stopsHashArray = Object.keys(line.stops);
    for (var j = 0; j < stopsHashArray.length; j++) {
      var stopHash = stopsHashArray[j];
      var stop = line.stops[stopHash];

      if (stops[stop.order])
        stops[stop.order].push({geo: stop.geo, trip: stop.trip, order: stop.order});
      else
        stops[stop.order] = [{geo: stop.geo, trip: stop.trip, order: stop.order}];
    }

    var stopsOrder = Object.keys(stops).sort(function (a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    });

    var trips = [];
    for (var j = 0; j < stops[stopsOrder[0]].length; j++) {
      stops[stopsOrder[0]][j].trip = j;
      trips[j] = {};
      trips[j][stopsOrder[0]] = {
        geo: stops[stopsOrder[0]][j].geo,
        trip: stops[stopsOrder[0]][j].trip
      }; // Start a new trip with one of the initil points
    }

    stopsOrder.splice(0,1);

    var uncertainPoints = [];

    for (var j = 0; j < stopsOrder.length; j++) {
      var currentStopNumber = parseInt(stopsOrder[j], 10);

      var usedStops = [];
      for (var k = 0; k < trips.length; k++) {
        var currentTrip = trips[k];
        var tripStops = Object.keys(currentTrip);
        var lastStopNumber = parseInt(tripStops[tripStops.length - 1], 10);
        var lastStop = currentTrip[lastStopNumber];

        if (lastStopNumber == currentStopNumber - 1) {
          var stopsDistance = Infinity;
          var stopTrip = -1;

          var stopsInRange = 0;
          for (var u = 0; u < stops[stopsOrder[j]].length; u++) {
            if (usedStops.indexOf(u) == -1) {
              var currentStop = stops[stopsOrder[j]][u];
              var distance = geo.calculateDistance(lastStop.geo, currentStop.geo, 'm');

              if (distance <= 800)
                stopsInRange++;

              if (distance < stopsDistance) {
                stopsDistance = distance;
                stopTrip = u;
              }
            }
          }

          if (stopsInRange > 1)
            uncertainPoints.push(currentStopNumber);

          if (stopTrip != -1) {
            usedStops.push(stopTrip);

            stops[stopsOrder[j]][stopTrip].trip = k;
            currentTrip[currentStopNumber] = {
              geo: stops[stopsOrder[j]][stopTrip].geo,
              trip: stops[stopsOrder[j]][stopTrip].trip
            };
          }

          // stops[stopsOrder[j]].splice(stopTrip, 1);
        }
      }

    }

    if (uncertainPoints.length > 0) {
      // Rework paths
      // console.log("There are uncertainties on line: " + line.line);
      // console.log(uncertainPoints);

      var aTrip = trips[0];
      var bTrip = trips[1];
      var aTripStops = Object.keys(aTrip);
      var tripStartPoint = aTrip[aTripStops[0]];
      var tripEndPoint = aTrip[aTripStops[aTripStops.length-1]];
      var distance = geo.calculateDistance(tripStartPoint.geo, tripEndPoint.geo, 'm');
      if (distance < 15000) {
        console.log("Inconsitency on start and end position on line: " + line.line);
        console.log("Trying to fix anomaly...");
        var anomalyOrigin = parseInt(uncertainPoints[0], 10);
        var lastStop = parseInt(stopsOrder[stopsOrder.length - 1], 10);
        for (var j = anomalyOrigin; j <= lastStop; j++) {
          for (var k = 0; k < stops[j].length; k++) {
            var currentStop = stops[j][k];
            currentStop.trip = (currentStop.trip == 0) ? 1 : 0;
          }
        }
        // console.log(stops);
        // console.log("Distance between start and stop: " + distance);
      }
    }

    // Finished processing trips for line
    // Now should flatten the stops and update the line

    var flattenedStops = [];
    for (var j = 0; j < Object.keys(stops).length; j++) {
      flattenedStops = flattenedStops.concat(stops[Object.keys(stops)[j]]);
    }

    for (var j = 0; j < flattenedStops.length; j++) {
      var stop = flattenedStops[j];
      var stopHash = "" + stop.geo[0] + stop.geo[1] + "(" + stop.order + ")";

      line.stops[stopHash].trip = stop.trip;
    }

    processedLines[line.line] = line;
  }

  callback(lines, global.lines);
};

module.exports = methods;