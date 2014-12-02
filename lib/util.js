// lib/util.js

// ## Utility submodule

'use strict';

var _ = require('lodash');
var assert = require('assert');

// *assertVertexId*: Check whether we have a valid vertex ID.
var assertVertexId = module.exports.assertVertexId = function (id) {
  assert(_.isNumber(id));
};

// *getVertexId*: Extract the vertex ID from a Gremlin vertex.
var getVertexId = module.exports.getVertexId = function (gremlinVertex) {
  var id = gremlinVertex.getId();
  assertVertexId(id);
  return id.toString();
};

// *vertexAttributeGetter*: Returns a vertex ID function that extracts a specific
// attribute.
var vertexAttributeGetter = module.exports.vertexAttributeGetter = function (attributeName) {
  return function (gremlinVertex) {
    return gremlinVertex.valueSync(attributeName);
  };
};
