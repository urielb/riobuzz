/**
 * Created by urielbertoche on 12/3/2015.
 */

var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// App variables
var file_url = 'http://dadosabertos.rio.rj.gov.br/apiTransporte/Apresentacao/csv/gtfs/onibus/paradas/gtfs_todas-linhas-paradas.csv';
var DOWNLOAD_DIR = './downloads/';

// We will be downloading the files to a directory, so make sure it's there
// This step is not required if you have manually created the directory
var mkdir = 'mkdir -p ' + DOWNLOAD_DIR;
var child = exec(mkdir, function(err, stdout, stderr) {
  if (err) throw err;
  else download_file_httpget(file_url);
});

var http_options = {
  host: url.parse(file_url).host,
  port: 80,
  path: url.parse(file_url).pathname
};

var methods = {};

methods.read = function (options, callback) {
  if (options.file === undefined) {
    throw ("File not specified");
  }

  var file = options.file;
  var directory = options.directory || '';
  var encoding = options.encoding || 'utf8';
  var file_url = options.file_url;

  fs.readFile(directory + file, encoding, function (err, data) {
    if (err) {
      if (file_url !== undefined) {
        methods.download({file_url: file_url, directory: directory, file_name: file}, function (file) {
          methods.read()
        })
      }
    }
  });

};

/**
 * Download file given options, on end runs callback
 * @param file_url
 */
methods.download = function (options, callback) { // file_url, directory, file_name) {
  if (options.file_url === undefined) {
    throw ("File url not specified");
  }

  var file_url = options.file_url;
  var directory = options.directory || DOWNLOAD_DIR;
  var file_name = options.file_name || url.parse(file_url).pathname.split('/').pop();

  var file = fs.createWriteStream(directory + file_name);

  http.get(http_options, function(res) {
    res.on('data', function(data) {
      file.write(data);
    }).on('end', function() {
      file.end();
      console.log(file_name + ' downloaded to ' + directory);

      callback(directory + file_name);
    });
  });
};

module.exports = methods;