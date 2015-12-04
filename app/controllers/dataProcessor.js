/**
 * Created by urielbertoche on 12/3/2015.
 */

var csv_parser = require('csv-parse');
var request = require('request');
var downloader = require('../lib/downloader');

var url_all_stops_csv = "http://dadosabertos.rio.rj.gov.br/apiTransporte/Apresentacao/csv/gtfs/onibus/paradas/gtfs_todas-linhas-paradas.csv";

var methods = {};

function csv2json(csv, callback) {
  csv = csv.split('\r').join('');
  csv_parser(csv, {columns: true, rowDelimiter: '\n', delimiter: ',', skip_empty_lines: true}, function (error, output) {
    callback(error, output)
  });
}

function getCSVData() {

}

/**
 * Method that loads the CSV with all stops data into memory
 * @param callback
 */
methods.loadStopsCSV = function (callback) {
  console.log("Downloading CSV file.");
  request(url_all_stops_csv, function (error, response, body) {
    console.log("Done downloading CSV file.");
    console.log("Started parsing CSV.");
    csv2json(body, function (error, output) {
      console.log("Finished parsing CSV.");
      callback(error, output);
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

  methods.loadStopsCSV(function (error, output) {
    for (var i = 0; i < output.lenght; i++) {
      var stop = output[j];
      console.log(stop);

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

    console.log(lines);
    console.log(stops);

    callback(error, lines, stops);
  });
};

module.exports = methods;