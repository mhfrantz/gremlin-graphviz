// lib/index.js

// Functions in this module are asynchronous, returning a promise if no callback is supplied.

'use strict';

var assert = require('assert');
var graphviz = require('graphviz');
var Q = require('q');

// Construct a Graphviz graph from a Gremlin graph.
module.exports = Q.promised(function (gremlinGraph, opts) {
  var opts = opts || {};
  var graphName = opts.graphName || 'G';
  var graphvizGraph = graphviz.digraph(graphName);
  var gremlin = gremlinGraph.gremlin;

  var addVertexSideEffect = makeSideEffect(gremlin, gremlin.wrapVertex, function (vertex) {
    addVertex(graphvizGraph, vertex);
  });

  var Direction = gremlin.java.import('com.tinkerpop.gremlin.structure.Direction');

  var addEdgeSideEffect = makeSideEffect(gremlin, gremlin.wrapEdge, function (edge) {
    addEdge(graphvizGraph, Direction, edge);
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
var makeSideEffect = function (gremlin, wrapper, func) {
  // TODO: Try to do this without referencing Java, once gremlin-v3 supports it.
  return gremlin.java.newProxy('java.util.function.Consumer', {
    accept: function (traverser) {
      // Unwrap the object from the traverser.
      func(wrapper(traverser.getSync()));
    }
  });
};

// Add a vertex (synchronously) to a Graphviz graph based on a Gremlin vertex.
var addVertex = function (graphvizGraph, gremlinVertex) {
  assert(graphvizGraph);
  assert(gremlinVertex);
  graphvizGraph.addNode(gremlinVertex.getId());
};

// Add an edge (synchronously) to a Graphviz graph based on a Gremlin edge.
var addEdge = function (graphvizGraph, Direction, gremlinEdge) {
  assert(graphvizGraph);
  assert(gremlinEdge);
  // TODO: Switch this from a Java edge object to something from gremlin-v3.
  var iterators = gremlinEdge.unwrap().iteratorsSync();
  var inV = iterators.vertexIteratorSync(Direction.IN).nextSync();
  var outV = iterators.vertexIteratorSync(Direction.OUT).nextSync();
  graphvizGraph.addEdge(inV.idSync(), outV.idSync());
};
