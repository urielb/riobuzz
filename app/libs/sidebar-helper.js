/**
 * Created by urielbertoche on 8/27/15.
 */

var sidebar_menu = require('../config/sidebar.json');
var _ = require('underscore');
var uuid = require('node-uuid');
var lorem = require('lorem-ipsum');

var Sidebar = function (menu) {
  this.menu = menu;
  this.currentUrl = '';
  console.log("Side bar instantiated");
};

Sidebar.prototype.set_currentUrl = function (url) {
  this.currentUrl = url;
};

Sidebar.prototype.active_level_links = function (hash) {
  self = this;
  if (typeof hash === 'undefined')
    hash = this.menu;

  links = [];
  _.each(hash, function (obj,key) {
    if (self.highlighted(obj.highlight || obj.href)) {
      links = [obj];

      if (typeof obj.children !== 'undefined') {
        links.append(self.active_level_links(obj.children));
      }

      return_links = [];
      return_links = return_links.concat.apply(return_links, links);
      links = return_links;
    }
  });

  return links;
};

Sidebar.prototype.highlighted = function (rules) {
  self = this;
  result = false;
  _.each(rules, function (rule) {
    highlighted = true;

    switch(typeof rule) {
      case 'object':
        highlighted &= rule.test(self.currentUrl);
        break;
      case 'string':
        highlighted &= (rule == self.currentUrl);
        break;
        default:
            throw "highlighting rules should be a string or a regexp";
    }

    result |= highlighted;
  });

  return result;
};

Sidebar.prototype.log = function () {
  return console.log(arguments);
};

module.exports = function init (app) {
  var sidebar = new Sidebar(sidebar_menu);

  sidebar.set_currentUrl("/");

  var links = sidebar.active_level_links();
  app.locals.sidebar_menu = sidebar_menu;
  app.locals.sidebar = sidebar;
  app.locals.uuid = uuid;
  app.locals.lorem = lorem;
  app.locals._ = _;

  // Define global variables to be used in templates and other places
  app.use(function(req, res, next){
    res.locals.user = req.user;
    res.locals.requestedUrl = req.originalUrl;
    app.locals.sidebar.menu = sidebar_menu;
    app.locals.sidebar.set_currentUrl(req.originalUrl);
    next();
  });

  return sidebar;
};