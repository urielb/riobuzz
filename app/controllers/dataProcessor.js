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

global.invalidLines = {};

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getOtherTrip (trips, trip) {
  for (var i in trips) {
    i = trips[i];

    if (i.id != trip)
      return i.id;
  }
}

function addInvalidLine(line, reason) {
  if (global.invalidLines["#" + line] != undefined) {
    global.invalidLines["#" + line].reasons.push(reason);
  } else {
    global.invalidLines["#" + line] = {reasons: [reason]};
  }
}

function stopCompare(stopA, stopB) {
  if (stopA.order != stopB.order)
    return false;

  if (stopA.final != stopB.final)
    return false;

  if (stopA.geo[0] != stopB.geo[0] || stopA.geo[1] != stopB.geo[1])
    return false;

  return true;
}

methods.processLineStopsSequency2 = function (line, callback) {
  console.log("Processing line stops sequency for line #" + line.line);

  var stops = {};

  // Populate stops object in order
  for (var stopHash in line.stops) {
    var stop = line.stops[stopHash];

    if (stops[stop.order])
      stops[stop.order].push({geo: stop.geo, trip: stop.trip, order: stop.order});
    else
      stops[stop.order] = [{geo: stop.geo, trip: stop.trip, order: stop.order}];
  }

  // Make and array of the line stops ordered
  var stopsOrder = Object.keys(stops).sort(function (a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
  });

  // Trip class
  function Trip (trip) {
    this.id = trip;
    this.start = null;
    this.end = null;
    this.stops = {};

    return this;
  }

  Trip.prototype.addStop = function(stop) {
    stop.trip = this.id;
    this.stops[stop.order] = stop;
  };

  var trips = {
    0: new Trip(0),
    1: new Trip(1)
  };

  // If line doesnt have two stops with order 1, throw exception
  if (stops['1'].length < 2) {
    var message = "Not enough stops with order #1";
    return addInvalidLine(line.line, message);
  }

  // Initialize trips
  var tripA = trips[0];
  var tripB = trips[1];
  tripA.addStop(stops['1'][0]);
  tripB.addStop(stops['1'][1]);
  tripA.start = tripA.stops['1'];
  tripB.start = tripB.stops['1'];

  // Find last stops
  // Garanteed getting last stops order
  var lastStops = {};
  for (var order in stops) {
    var nextOrder = parseInt(order, 10) + 1;

    if (stops[nextOrder] == undefined || stops[nextOrder].length < stops[order].length) {
      lastStops[order] = stops[order];
    }
  }

  function stopSetTrip(stop, trip) {
    stop.trip = trip;
    for (var i in stops[stop.order]) {
      i = stops[stop.order][i];
      if (!stopCompare(i, stop)) {
        i.trip = getOtherTrip(trips, trip);
      }

    }

    return stop;
  }

  var lastStopsOrder = Object.keys(lastStops).sort(function (a, b) {
    return parseInt(b, 10) - parseInt(a, 10);
  });

  // Now I need to place the last stop accordingly to the trip
  // Working for 409
  for (var order in lastStopsOrder) {
    order = lastStopsOrder[order];
    var lastOrder = lastStops[order];
    for (var stop in lastOrder) {
      stop = lastOrder[stop];
      var maxDistance = 0;
      var stopTrip = null;

      for (var trip in trips) {
        trip = trips[trip];

        var distanceStop = geo.calculateDistance(trip.start.geo, stop.geo);
        if (distanceStop > maxDistance) {
          maxDistance = distanceStop;
          stopTrip = trip;
        }
      }

      if (stopTrip.end == null) {
        stopTrip.end = stop;
        stopTrip.addStop(stop);
      }
    }
  }

  // Validate line ends
  if (tripA.end == null || tripB.end == null) {
    return addInvalidLine(line.line, "Couldn't find proper trip ends.");
  }

  for (var trip in trips) {
    trip = trips[trip];
    trip.end['final'] = true;
  }

  /**
   * UPDATE #####
   * THERE IS NO NEED TO ITER ON ALL TRIPS, SINCE IF A STOP DOESNT BELONG TO ONE TRIP, IT WILL BELONG TO THE OTHER
   * ############
   * Now iter through all stops starting on stop with order 2, for each trip
   * tries to find
   */

  // MIGHT NEED TO ITERATE THROUGH TRIPS ANYWAY
  for (var trip in trips) {
    var trip = trips[trip];

    var currentStop = trip.start;
    var endStop = trip.end;

    var uncertainPoints = {};

    var stack = new Array();
    var backtracking = false;

    var counter = 0;

    while (currentStop != endStop) {
      counter++;
      if (counter > 750) {
        addInvalidLine(line.line, "Limit of 750 operations to solve line breached.");
        break;
      }

      // console.log(currentStop, endStop);
      if (currentStop.order == endStop.order && !stopCompare(currentStop, endStop)) {
        backtracking = true;
      }

      if (backtracking) {
        currentStop = stack.pop();
        stopSetTrip(currentStop, trip.id);
        backtracking = false;

        if (currentStop == undefined) {
          addInvalidLine(line.line, "Backtracking stack empty, didn't reach end");
          return;
        }

      } else {
        var currentOrder = currentStop.order;
        var nextOrder = (parseInt(currentOrder, 10) + 1) + "";

        var nextStops = stops[nextOrder];
        var minDistance = Infinity;
        var maxDistance = 0;
        var minDistanceStop = null;
        var maxDistanceStop = null;
        var stopsInRange = 0;

        for (var stop in nextStops) {
          stop = nextStops[stop];

          var distance = geo.calculateDistance(currentStop.geo, stop.geo, 'm');
          if (distance < minDistance) {
            minDistance = distance;
            minDistanceStop = stop;
          }

          if (distance > maxDistance) {
            maxDistance = distance;
            maxDistanceStop = stop;
          }

          if (distance < 800) {
            stopsInRange++;
          }
        }

        if (minDistanceStop != null) {
          currentStop = stopSetTrip(minDistanceStop, trip.id);
          // currentStop = minDistanceStop;
          // currentStop.trip = trip.id;
        }

        if (stopsInRange > 1) {
          if (minDistance != maxDistance) {
            stack.push(maxDistanceStop);
          }
        }
      }
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

  callback("Finished processing stops for line #" + line.line);
};

methods.processLineStopsSequency = function (lines, callback) {
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

  for (var line in lines) {
    line = global.lines[lines[line]];

    try {
      methods.processLineStopsSequency2(line, function (message) {
        console.log(message);
      })
    } catch (error) {
      console.error(error);
      addInvalidLine(line.line, error);
    }
  }
};

module.exports = methods;