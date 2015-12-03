/**
 * Created by urielbertoche on 12/3/2015.
 */

var csv_parser = require('csv-parse');
var request = require('request');

var url_all_stops_csv = "http://dadosabertos.rio.rj.gov.br/apiTransporte/Apresentacao/csv/gtfs/onibus/paradas/gtfs_todas-linhas-paradas.csv";

var methods = {};

function csv2json(csv, callback) {
  //csv = csv.split('\r').join('');
  csv_parser(csv, {columns: true, rowDelimiter: '\n', delimiter: ',', skip_empty_lines: true}, function (error, output) {
    callback(error, output)
  });
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

module.exports = methods;