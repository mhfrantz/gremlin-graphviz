// lib/index.js

// Functions in this module are asynchronous, returning a promise if no callback is supplied.

'use strict';

var assert = require('assert');
var graphviz = require('graphviz');
var Q = require('q');

// Construct a Graphviz graph from a Gremlin graph.
// *opts* is an optional object allowing overriding default behavior:
// * *graphName*: Name of the Graphviz graph [default: 'G']
// * *vertexId*: Function that returns vertex ID string from a Gremlin vertex [default: util.getVertexId]
var factory = module.exports = Q.promised(function (gremlinGraph, opts) {
  var graphvizGraph = new GraphvizGraph(gremlinGraph, opts);
  var gremlin = gremlinGraph.gremlin;

  var vertexTraversal = gremlinGraph.V();
  var edgeTraversal = gremlinGraph.E();

  return iterate(vertexTraversal, function (vertex) { addVertex(graphvizGraph, vertex); }).
    then(function () {
      return iterate(edgeTraversal, function (edge) { addEdge(graphvizGraph, edge); });
    }).
    then(function () {
      return graphvizGraph;
    });
});

var GraphvizGraph = function (gremlinGraph, opts) {
  this.opts = opts || {};
  var graphName = this.opts.graphName || 'G';
  this.impl = graphviz.digraph(graphName);
};

// Haul a property getter from the implementation class.
var haulProperty = function (name) {
  Object.defineProperty(GraphvizGraph.prototype, name,
                        { get: function () {
                          return this.impl[name];
                        }});
};

// ## Immutable properties
// Expose certain immutable properties of the graphviz graph.
['id',
 'type'
].map(haulProperty);

// Haul a property getter/setter from the implementation class.
var haulMutableProperty = function (name) {
  Object.defineProperty(GraphvizGraph.prototype, name,
                        {
                          get: function () {
                            return this.impl[name];
                          },
                          set: function (value) {
                            return this.impl[name] = value;
                          }
                        });
};

// ## Mutable properties
// Expose certain mutable properties of the graphviz graph.
['use'
].map(haulMutableProperty);

// Haul a method from the implementation class.
var haulMethod = function (name) {
  GraphvizGraph.prototype[name] = function () {
    // var args = Array.prototype.slice.call(arguments);
    return this.impl[name].apply(this.impl, arguments);
  };
};

// ## Methods
// All of the useful methods are exported.
[
  'addCluster',
  'addEdge',
  'addNode',
  'clusterCount',
  'edgeCount',
  'get',
  'getCluster',
  'getEdgeAttribut',
  'getNode',
  'getNodeAttribut',
  'nodeCount',
  'output',
  'render',
  'set',
  'setEdgeAttribut',
  'setGraphVizPath',
  'setNodeAttribut',
  'to_dot'
].map(haulMethod);

// Iterate through a Gremlin traversal
var iterate = function (traversal, process) {
  return traversal.forEach(process);
};

// Add a vertex (synchronously) to a Graphviz graph based on a Gremlin vertex.
var addVertex = function (graphvizGraph, gremlinVertex) {
  assert(graphvizGraph);
  assert(graphvizGraph.impl);
  assert(gremlinVertex);

  var vertexId = graphvizGraph.opts.vertexId || util.getVertexId;
  graphvizGraph.impl.addNode(vertexId(gremlinVertex));
};

// Add an edge (synchronously) to a Graphviz graph based on a Gremlin edge.
var addEdge = function (graphvizGraph, gremlinEdge) {
  assert(graphvizGraph);
  assert(graphvizGraph.impl);
  assert(gremlinEdge);

  // Pull the Direction enumeration from the embedded Gremlin object.
  var gremlin = gremlinEdge.gremlin;
  assert(gremlin);
  var Direction = gremlin.Direction;
  assert(Direction);

  // TODO: Switch this from a Java edge object to something from gremlin-v3.
  var vertexId = graphvizGraph.opts.vertexId || util.getVertexId;
  var iterators = gremlinEdge.unwrap().iteratorsSync();
  var inV = iterators.vertexIteratorSync(Direction.IN).nextSync();
  assert(inV);
  var inId = vertexId(gremlin.wrapVertex(inV));
  var outV = iterators.vertexIteratorSync(Direction.OUT).nextSync();
  assert(outV);
  var outId = vertexId(gremlin.wrapVertex(outV));
  var graphvizEdge = graphvizGraph.impl.addEdge(outId.toString(), inId.toString());

  // See if we have to label the edge.
  var edgeLabeler = graphvizGraph.opts.edgeLabel;
  if (edgeLabeler) {
    var edgeLabel = edgeLabeler(gremlinEdge);
    if (edgeLabel) {
      graphvizEdge.set('label', edgeLabel);
    }
  };
};

// Import the utilities module.
var util = module.exports.util = require('./util.js');
