var express = require("express");
var path = require('path');
var app = express();

// set up database
var dbConfig = require('../config/mongodb.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// load lines and stops with dataProcessor
var rioBuzzDataProcessor = require('./controllers/dataProcessor');
rioBuzzDataProcessor.processStops(function () {
  console.log("Data loaded: " + Object.keys(global.lines).length + " lines and " + Object.keys(global.stops).length + " stops found.");

  rioBuzzDataProcessor.processNearStops(function() {
  });
});

// Set public dir
app.use(express.static(path.join(__dirname, '../public')));

// Set up routes
var routes = require('./routes/routes');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
    stack: err.stack
  });

  next(err);
});

module.exports = app;