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

        // Set up lines
        if (lines[stop.linha] !== undefined) {
          lines[stop.linha].stops.push({
            geo: [stop.latitude, stop.longitude],
            order: stop.sequencia,
            trip: -1
          });
        } else {
          lines[stop.linha] = {
            line: stop.linha,
            description: stop.descricao,
            agency: stop.agencia,
            stops: []
          };
        }

        // Set up stops
        var hashStop = stop.latitude + "" + stop.longitude;
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

methods.redoSequency = function (callback) {
  console.log("Redoing lines stops sequency");

  callback();
};

module.exports = methods;