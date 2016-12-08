/**
 * Created by urielbertoche on 9/11/2015.
 */

var map;
var markerOrigin;
var markerDestination;

$(function () {
  var markers = [];
  var polyLines = [];

  function easyMarker2(coord, options) {
    markers.push(easyMarker(coord.geo[0], coord.geo[1], options));
  }

  function easyMarker(lat, lng, options) {
    if (map == undefined || map == null)
      return;

    var defaults = {
      icon: 'green-dot',
      label: ''
    };

    options = $.extend({}, options, defaults);

    var latlng = {
      lat: lat,
      lng: lng
    };

    // green-dot
    var icon = "http://maps.google.com/mapfiles/ms/icons/{0}.png";
    icon = icon.replace("{0}", options.icon);

    return new google.maps.Marker({
      position: latlng,
      map: map,
      icon: icon,
      label: options.label
    });
  }

  function initMap() {
    // -22.941706804417315, -43.17986578833006
    var aCoord = {lat: -22.941706, lng: -43.179865};
    var bCoord = {lat: -22.954131, lng: -43.167864};

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

    function setMapOnAll(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }

      for (var i = 0; i < polyLines.length; i++) {
        polyLines[i].setMap(map);
      }
    }

    function deletaMarcadores() {
      setMapOnAll(null);

      polyLines = [];
      markers = [];
    }

    function loadStops(data, pontoInicial, pontoFinal) {
      var stopsCoords = [];
      var salvar = false;

      for (var i = 0; i < data.length; i++) {
        var stop = data[i];

        if (stop.geo[0] == pontoInicial.geo[0] && stop.geo[1] == pontoInicial.geo[1])
          salvar = true;

        if (salvar)
          stopsCoords.push({
            lat: stop.geo[0],
            lng: stop.geo[1]
          });

        if (stop.geo[0] == pontoFinal.geo[0] && stop.geo[1] == pontoFinal.geo[1])
          salvar = false;
      }

      return stopsCoords;
    }

    var desenhaRota = function (linha, pontoInicial, pontoFinal) {
      // var bounds = new google.maps.LatLngBounds();
      var trip = pontoFinal.trip;
      if (trip == undefined)
        trip = pontoInicial.trip;

      $.get("/stops/line/" + linha + "/" + trip, function (data) {
        var stopsCoords = loadStops(data, pontoInicial, pontoFinal);

        var polyLine = new google.maps.Polyline({
          path: stopsCoords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        polyLines.push(polyLine);

        polyLine.setMap(map);
        var points = polyLine.getPath().getArray();
        //for (var n = 0; n < points.length; n++)
        //  bounds.extend(points[n]);
        //
        //map.fitBounds(bounds);
      });

    };

    function exibeRota( event ) {
      deletaMarcadores();
      var rota = event.data.rota;
      console.log(rota);
      if (rota.pontoComutacao1 == undefined) {
        easyMarker2(rota.origem);
        easyMarker2(rota.destino);

        // TODO: Desenha rota
        desenhaRota(event.data.numero, rota.origem, rota.destino);
      } else {
        if (rota.pontoComutacao2 == undefined) {
          var linha1 = (/^(.*?)\sx/g).exec(event.data.numero)[1];
          var linha2 = (/x\s(.*)$/g).exec(event.data.numero)[1];
          // console.log(linha1, linha2);

          easyMarker2(rota.pontoInicial);
          desenhaRota(linha1, rota.pontoInicial, rota.pontoComutacao1);
          easyMarker2(rota.pontoComutacao1);
          easyMarker2(rota.pontoFinal);
          desenhaRota(linha2, rota.pontoComutacao1, rota.pontoFinal);
        } else {
          // Caso tenha seja comutacao nos pontos proximos
          var linha1 = (/^(.*?)\sx/g).exec(event.data.numero)[1];
          var linha2 = (/x\s(.*)$/g).exec(event.data.numero)[1];
          // console.log(linha1, linha2);

          easyMarker2(rota.pontoInicial);
          desenhaRota(linha1, rota.pontoInicial, rota.pontoComutacao1);
          easyMarker2(rota.pontoComutacao1);
          easyMarker2(rota.pontoComutacao2);
          easyMarker2(rota.pontoFinal);
          desenhaRota(linha2, rota.pontoComutacao2, rota.pontoFinal);
        }
      }
      console.log(event.data);
    }

    $.get("/api/generate/routes/" + origin + "/" + destination, function (data) {
      var comutacoes = data.commutingLines;
      var diretas = data.directLines;
      $("<p>").append("Linhas diretas").appendTo(result);
      if (Object.keys(diretas).length == 0)
        result.append($("<small>").append("Nenhuma linha direta encontrada"));
      else {
        for (numero in diretas) {
          var linha = diretas[numero];
          var item = $("<a href='#' class='cursor-pointer'>"+numero+"</a>")
              .on("click", {rota: linha, numero: numero}, exibeRota) //click(function () { console.log(numero, linha); })
              .appendTo(result);
          result.append($("<br>"));
        }

        // result.append(lista);
      }

      $("<p>").append("Rotas c/ comutação").appendTo(result);
      if (Object.keys(comutacoes).length == 0)
        result.append($("<small>").append("Nenhuma rota encontrada"));
      else {
        // var lista = $("<ul>");
        for (numero in comutacoes) {
          var linha = comutacoes[numero];
          var item = $("<a href='#' class='cursor-pointer'>")
              .on("click", {rota: linha, numero: numero}, exibeRota) //click(function () { console.log(numero, linha); })
              .append(numero)
              .appendTo(result);
          result.append($("<br>"));
        }

        // result.append(lista);
      }

      result.dialog();
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