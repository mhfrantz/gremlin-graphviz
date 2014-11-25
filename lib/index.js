// lib/index.js

// Functions in this module are asynchronous, returning a promise if no callback is supplied.

'use strict';

var graphviz = require('graphviz');
var Q = require('q');

// Construct a Graphviz graph from a Gremlin graph.
module.exports = Q.promised(function (gremlinGraph, opts) {
  var opts = opts || {};
  var graphName = opts.graphName || 'G';
  var graphvizGraph = graphviz.digraph(graphName);
  return graphvizGraph;
});
