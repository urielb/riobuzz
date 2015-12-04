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
 * Load and process stops from CSV
 */
router.get('/processStops/', function (req, res, next) {
  dataProcessor.processStops(function (error, lines, stops) {
    if (error) {
      var err = new Error();
      err.status = 500;
      err.message = error.toString();
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