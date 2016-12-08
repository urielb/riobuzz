/**
 * Created by urielbertoche on 12/7/2016.
 */

var Stop = require("../models/stop");

var geo = require('../lib/geo');
var config = require('../../config/settings');

var methods = {};

function findNearStops (coordinates) {
  var stopKeys = Object.keys(global.stops);
  var nearStops = [];

  for (var i = 0; i < stopKeys.length; i++) {
    var stop = global.stops[stopKeys[i]];
    /**
     * if close enough, add to nearStops array
     */
    var dist = geo.calculateDistance(coordinates, stop.geo, 'm');
    if (dist < config.MAX_STOP_DISTANCE) {
      nearStops.push(stop);
    }
  }

  return nearStops;
}

function matchDirectLines (origem, destino, initialStops, finalStops) {
  var matchingLines = {};

  function checaPontosCoerentes(linha, inicial, final) {
    var regexOrdem = /\((.*?)\)/g;
    var inicial = inicial.replace("#" + linha, "");
    var ordemInicial = parseInt(regexOrdem.exec(inicial)[1], 10);

    regexOrdem = /\((.*?)\)/g
    var final = final.replace("#" + linha, "");
    var ordemFinal = parseInt(regexOrdem.exec(final)[1], 10);

    if (ordemFinal <= ordemInicial)
      return false;

    var pontoInicial = global.lines[linha].stops[inicial];
    var pontoFinal = global.lines[linha].stops[final];

    if (pontoInicial.trip != pontoFinal.trip)
      return false;

    return {inicial: pontoInicial, final: pontoFinal};
  }

  for (var i = 0; i < finalStops.length; i++) {
    var pontoFinal = finalStops[i];
    var linhaRegexp= /#(.*?)\(/g;
    var matchFinal = linhaRegexp.exec(pontoFinal);
    var linhaFinal = matchFinal[1];

    for (var j = 0; j < initialStops.length; j++) {
      linhaRegexp= /#(.*?)\(/g;
      var pontoInicial = initialStops[j];
      var matchInicial = linhaRegexp.exec(pontoInicial);
      var linhaInicial = matchInicial[1];

      /**
       * Agora verifica se os dois pontos estão no mesmo trajeto e o final tem ordem maior que o inicial
       */
      if (linhaFinal == linhaInicial) {
        /**
         * Se os pontos forem coerentes, verifica se já existe na lista de matches, se já existir, checa se a distancia é menor em algum ponto
         */
        try {
          var pontos = checaPontosCoerentes(linhaInicial, pontoInicial, pontoFinal);
          if (pontos != false) {
            if (matchingLines[linhaInicial] == undefined) {
              matchingLines[linhaInicial] = {
                linha: linhaInicial,
                origem: pontos.inicial,
                destino: pontos.final
              }
            } else {
              // Verificar se o ponto é mais proximo do que os existentes
              var pontoOrigemAtual = matchingLines[linhaInicial].origem;
              if (pontos.inicial.trip == pontoOrigemAtual.trip && geo.calculateDistance(pontos.inicial.geo, origem) < geo.calculateDistance(pontoOrigemAtual.geo, origem)) {
                matchingLines[linhaInicial].origem = pontos.inicial;
              }

              var pontoDestinoAtual = matchingLines[linhaInicial].destino;
              if (pontos.final.trip == pontoDestinoAtual.trip && geo.calculateDistance(pontos.final.geo, destino) < geo.calculateDistance(pontoDestinoAtual.geo, destino)) {
                matchingLines[linhaInicial].destino = pontos.final;
              }
            }
          }
        } catch (e) { console.log(e); }
      }
    }
  }

  return matchingLines;
}

function matchCommutingLines (origem, destino, initialStops, finalStops) {
  var matchingLines = {};

  function getLinhaProximosPontos(linha, ponto) {
    var ponto = ponto.replace("#" + linha, "");
    var pontoInicio = global.lines[linha].stops[ponto];

    console.log(linha, pontoInicio);
    return [];
  }

  for (var i = 0; i < finalStops.length; i++) {
    var pontoFinal = finalStops[i];
    var linhaRegexp= /#(.*?)\(/g;
    var matchFinal = linhaRegexp.exec(pontoFinal);
    var linhaFinal = matchFinal[1];

    for (var j = 0; j < initialStops.length; j++) {
      linhaRegexp = /#(.*?)\(/g;
      var pontoInicial = initialStops[j];
      var matchInicial = linhaRegexp.exec(pontoInicial);
      var linhaInicial = matchInicial[1];

      getLinhaProximosPontos(linhaInicial, pontoInicial);
    }
  }

  return matchingLines;
}

methods.findRoutes = function (origin, destination) {
  origin = [parseFloat(origin[0]), parseFloat(origin[1])];
  destination = [parseFloat(destination[0]), parseFloat(destination[1])];

  console.log(origin, destination);
  var originNearStops = findNearStops(origin);
  var destinationNearStops = findNearStops(destination);
  var finalStops = [];
  var initialStops = [];

  // Une pontos de parada, informando dados como origem
  (function () {
    for (var i = 0; i < destinationNearStops.length; i++) {
      var stop = destinationNearStops[i];
      for (var j = 0; j < stop.lines.length; j++) {
        var newStopName = stop.geo[0] + "" + stop.geo[1];
        newStopName += "#" + stop.lines[j];
        finalStops.push(newStopName);
      }
    }

    for (var i = 0; i < originNearStops.length; i++) {
      var stop = originNearStops[i];
      for (var j = 0; j < stop.lines.length; j++) {
        var newStopName = stop.geo[0] + "" + stop.geo[1];
        newStopName += "#" + stop.lines[j];
        initialStops.push(newStopName);
      }
    }
  })();

  console.log("originNearStops", originNearStops.length);
  console.log("destinationNearStops", destinationNearStops.length);

  // var directLines = matchDirectLines(origin, destination, initialStops, finalStops);
  var commutingLines = matchCommutingLines(origin, destination, initialStops, finalStops);

  return {
    directLines: directLines,
    commutingLines: commutingLines
  };
};

module.exports = methods;