/**
 * Created by urielbertoche on 12/3/2015.
 */

var express = require('express');
var router = express.Router();

var dataProcessor = require('../controllers/dataProcessor');

/**
 * Main action
 */
router.get('/', function(req, res){
  res.render('index', {});
});

/**
 * Get all lines information
 */
router.get('/lines/', function (req, res, next) {
  res.json({lines: global.lines});
});

/**
 * Get line information
 */
router.get('/lines/:line', function (req, res, next) {
  var line = global.lines[req.params['line']];

  res.json({line: line});
});

/**
 * Get all lines information
 */
router.get('/stops/', function (req, res, next) {
  res.json({stops: global.stops});
});

/**
 * Get stop information
 */
router.get('/stops/:stop', function (req, res, next) {
  var stop = global.lines[req.params['stop']];

  res.json({stop: stop});
});

/**
 * Load and process stops from CSV
 */
router.get('/processStops/', function (req, res, next) {
  dataProcessor.processStops(function (err, lines, stops) {
    if (err) {
      next(err);
    } else {
      var jsonResponse = {
        lines: lines,
        stops: stops
      };
      res.json(jsonResponse);
    }
  });
});

/**
 * Process stops near stops
 */
router.get('/processNearStops/', function (req, res, next) {
  dataProcessor.processNearStops(function (err) {
    if (err) {
      next(err);
    } else {
      var jsonResponse = {
        stops: global.stops
      };
      res.json(jsonResponse);
    }
  });
});

/**
 * Process stops near stops
 */
router.get('/processLineStopsSequency/', function (req, res, next) {
  var lines = req.query['lines'] || "";

  dataProcessor.processLineStopsSequency(lines, function (processedLines, stops) {
    console.log("done processing");
    res.json(stops);
  });
});

/**
 * Get stops for a trip of a given line
 */
router.get('/stops/line/:line/:trip', function (req, res, next) {
  var line = global.lines[req.params.line];

  if (line) {
    var stopsHashArray = Object.keys(line.stops);
    var stops = [];

    for (var i = 0; i < stopsHashArray.length; i++) {
      var stopHash = stopsHashArray[i];
      var stop = line.stops[stopHash];

      if (stop.trip == req.params.trip)
        stops.push(stop);
    }

    stops.sort(function (a, b) {
      return parseInt(a.order) - parseInt(b.order);
    });

    res.json(stops);
  } else {
    next();
  }

});

module.exports = router;