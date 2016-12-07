/**
 * Created by urielbertoche on 9/11/2015.
 */

var map;
var markerOrigin;
var markerDestination;

$(function () {

  function easyMarker(lat, lng, options) {
    if (map == undefined || map == null)
      return;

    var defaults = {
      icon: 'green-dot',
      label: '0'
    };

    $.extend(options, defaults);

    var latlng = {
      lat: lat,
      lng: lng
    };

    // green-dot
    var icon = "http://maps.google.com/mapfiles/ms/icons/{0}.png";
    icon.replace("{0}", options.icon);

    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: icon,
      label: options.label
    });
  }

  function initMap() {
    var aCoord = {lat: -22.936569, lng: -43.183814};
    var bCoord = {lat: -22.955238, lng: -43.164689};

    map = new google.maps.Map(document.getElementById("map"), {
      center: aCoord,
      zoom: 14,
      //disableDefaultUI: true
    });

    var position = new google.maps.LatLng(aCoord.lat, aCoord.lng);

    markerOrigin = new google.maps.Marker({
      position: position,
      map: map,
      draggable: true,
      title: 'Origem',
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    });

    markerDestination = new google.maps.Marker({
      position: bCoord,
      map: map,
      draggable: true,
      title: 'Destino',
      icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    });

  }

  $("#search").on('click', function () {
    var origin = markerOrigin.getPosition().toString();
    var destination = markerDestination.getPosition().toString();
    origin = origin.replace(" ", "").replace("(", "").replace(")", "");
    destination = destination.replace(" ", "").replace("(", "").replace(")", "");
    // var walkingTime = $("#tempoAndando").val();

    //initial = JSON.parse("[" + initial + "]");
    //arrival = JSON.parse("[" + arrival + "]");

    var result = $("#result");
    result.html("");

    $.get("/api/generate/routes/" + origin + "/" + destination, function (data) {
      console.log(data);
    });

    // $.get("/getCommutingPoints/?initial=" + initial + "&arrival=" + arrival, function (data) {

    //  var combinations = [];
    //  for (var i = 0; i < data.length; i++) {
    //    var combination = data[i];
    //    var cmbName = "";
    //    if (combination.startingLine == combination.finishingLine)
    //      cmbName = combination.startingLine;
    //    else
    //      var cmbName = combination.startingLine + " -> " + combination.finishingLine;
    //    if (combinations.indexOf(cmbName) < 0)
    //      combinations.push(cmbName);
    //  }
    //
    //  if (combinations.length > 0) {
    //    result.append("<br/>").append(combinations.join("<br/>"));
    //    result.append("<br/><br/>");
    //  } else {
    //    result.append("<br/>Nenhuma opção disponível encontrada nesse caminho<br/><br/>");
    //  }
    //
    //  result.dialog();
    //  //result.append(JSON.stringify(data, null, 2));
    //});
  });

  $("#tempoAndando").on("change", function (evt) {
    $("#valRange").html($(this).val());
  });

  initMap();

});