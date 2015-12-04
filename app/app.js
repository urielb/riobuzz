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

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json(err);
});

module.exports = app;