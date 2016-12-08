/**
 * Created by urielbertoche on 12/3/2015.
 */

var express = require('express');
var router = express.Router();

var dataProcessor = require('../controllers/dataProcessor');
var api = require("../controllers/api");

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

/**
 * Show routes for a line
 */
router.get('/map/routes/:line', function (req, res, next) {
  var line = global.lines[req.params.line];

  if (line) {
    if (global.invalidLines["#" + line.line]) {
      res.json({
        line: line.line,
        error: 'Line listed on invalid lines',
        reasons: global.invalidLines["#" + line.line]['reasons']
      });
    } else {
      res.render('map', {
        line: line
      });
    }
  } else {
    next();
  }
});

router.get('/workingLines', function (req, res, next) {
  var workingLines = [];
  for (var line in global.lines) {
    if (global.invalidLines["#" + line] == undefined) {
      workingLines.push(line);
    }
  }

  res.render('workingLines', {
    workingLines: workingLines
  });
});

/**
 * show faulty lines
 */
router.get('/faultyLines', function (req, res, next) {
  res.json(global.invalidLines);
});

/**
 *
 */
router.get('/reports', function (req, res, next) {
  var jsonReport = {
    invalidLinesCount: Object.keys(global.invalidLines).length,
    invalidLines: global.invalidLines,
    totalLinesCount: Object.keys(global.lines).length,
    validLinesCount: Object.keys(global.lines).length - Object.keys(global.invalidLines).length
  };

  res.json(jsonReport);
});

/**
 * Action to calculate route given origin and destiny points
 */
router.get('/api/generate/routes/:origin/:destination', function (req, res, next) {
  var origin = req.params.origin;
  var destination = req.params.destination;

  origin = origin.split(',');
  destination = destination.split(',');

  var routes = api.findRoutes(origin, destination);

  // console.log(origin, destiny);

  res.json(routes);
});

module.exports = router;