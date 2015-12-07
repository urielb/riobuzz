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

module.exports = router;