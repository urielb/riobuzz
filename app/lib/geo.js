/**
 * Created by urielbertoche on 12/6/2015.
 */


var R = 6371; // km

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var methods = {};

methods.calculateDistance = function (pointA, pointB, unity) {
  if (!(pointA instanceof Array))
    pointA = [pointA.latitude, pointA.longitude];

  if (!(pointB instanceof Array))
    pointB = [pointB.latitude, pointB.longitude];

  var lat2 = pointB[0];
  var lat1 = pointA[0];
  var lon2 = pointB[1];
  var lon1 = pointA[1];
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if (unity == 'm') {
    return d * 1000; // in m
  }

  return d; // in km
};

methods.walkingHours = function (distance, walking_speed) {
  if (walking_speed === undefined) {
    walking_speed = 4.5; // in km/h
  }

  walking_time = distance / walking_speed;

  return walking_time;
};

methods.walkingMinutes = function (walking_hours) {
  return walking_hours * 60;
};

module.exports = methods;