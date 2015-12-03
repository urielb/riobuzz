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
  dataProcessor.loadStopsCSV(function (error, output) {
    if (error) next(error);

    res.json(output);
  });
});

module.exports = router;