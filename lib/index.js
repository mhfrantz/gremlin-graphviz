// lib/index.js

// Functions in this module are asynchronous, returning a promise if no callback is supplied.

'use strict';

var assert = require('assert');
var graphviz = require('graphviz');
var Q = require('q');

// Construct a Graphviz graph from a Gremlin graph.
var factory = module.exports = Q.promised(function (gremlinGraph, opts) {
  var graphvizGraph = new GraphvizGraph(gremlinGraph, opts);
  var gremlin = gremlinGraph.gremlin;

  var vertexTraversal = gremlinGraph.V();
  var edgeTraversal = gremlinGraph.E();

  return iterate(vertexTraversal, function (vertex) { addVertex(graphvizGraph, vertex); }).
    then(function () {
      var Direction = gremlin.java.import('com.tinkerpop.gremlin.structure.Direction');
      return iterate(edgeTraversal, function (edge) { addEdge(graphvizGraph, Direction, edge); });
    }).
    then(function () {
      return graphvizGraph;
    });
});

var GraphvizGraph = function (gremlinGraph, opts) {
  var graphvizGraph = this;
  var opts = opts || {};
  var graphName = opts.graphName || 'G';
  this.impl = graphviz.digraph(graphName);

};

// Haul a property getter from the implementation class.
var haulProperty = function (name) {
  Object.defineProperty(GraphvizGraph.prototype, name,
                        { get: function () {
                          return this.impl[name];
                        }});
};

// ## Expose certain properties of the graphviz graph.
['id',
 'type'
 // TODO: More properties
].map(haulProperty);

var haulMethod = function (name) {
  GraphvizGraph.prototype[name] = function () {
    // var args = Array.prototype.slice.call(arguments);
    return this.impl[name].apply(this.impl, arguments);
  };
};

// All of the useful read-only methods are exported.
['getNode',
 'edgeCount',
 'nodeCount',
 'output',
 'to_dot'
].map(haulMethod);

var iterate = function (traversal, process) {
  return traversal.hasNext().
    then(function (hasNext) {
      if (hasNext) {
        return traversal.next();
      }
    }).
    then(function (element) {
      if (element) {
        process(element);
        return iterate(traversal, process);
      }
    });
};

// Add a vertex (synchronously) to a Graphviz graph based on a Gremlin vertex.
var addVertex = function (graphvizGraph, gremlinVertex) {
  assert(graphvizGraph);
  assert(graphvizGraph.impl);
  assert(gremlinVertex);
  var id = gremlinVertex.getId();
  graphvizGraph.impl.addNode(id.toString());
};

// Add an edge (synchronously) to a Graphviz graph based on a Gremlin edge.
var addEdge = function (graphvizGraph, Direction, gremlinEdge) {
  assert(graphvizGraph);
  assert(graphvizGraph.impl);
  assert(gremlinEdge);
  // TODO: Switch this from a Java edge object to something from gremlin-v3.
  var iterators = gremlinEdge.unwrap().iteratorsSync();
  var inV = iterators.vertexIteratorSync(Direction.IN).nextSync();
  assert(inV);
  var inId = inV.idSync();
  assert(inId);
  var outV = iterators.vertexIteratorSync(Direction.OUT).nextSync();
  assert(outV);
  var outId = outV.idSync();
  assert(outId);
  graphvizGraph.impl.addEdge(outId.toString(), inId.toString());
};
