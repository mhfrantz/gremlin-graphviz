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

  var addVertexSideEffect = makeSideEffect(gremlinGraph.gremlin, function (vertex) {
    addVertex(graphvizGraph, vertex);
  });

  var addEdgeSideEffect = makeSideEffect(gremlinGraph.gremlin, function (edge) {
    addEdge(graphvizGraph, edge);
  });

  // Add nodes to the graph.
  var traversal = gremlinGraph.
    V().sideEffect(addVertexSideEffect).
    bothE().sideEffect(addEdgeSideEffect);
  // TODO: Convert to promise API when that's ready.
  // traversal.iterate().
  //   then(function () { return graphvizGraph; });
  traversal.iterate();
  return graphvizGraph;
});

// Create a Gremlin side-effect object from a JS function.
var makeSideEffect = function (gremlin, func) {
  return gremlin.java.newProxy('java.util.function.Consumer', { accept: func });
};

// Add a vertex (synchronously) to a Graphviz graph based on a Gremlin vertex.
var addVertex = function (graphvizGraph, gremlinVertex) {
  // TODO
};

// Add an edge (synchronously) to a Graphviz graph based on a Gremlin edge.
var addEdge = function (graphvizGraph, gremlinEdge) {
  // TODO
};
