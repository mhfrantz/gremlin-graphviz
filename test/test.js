// test/test.js
// Unit tests for gremlin-graphviz.

describe ('gremlin-graphviz', function () {

  var _ = require('lodash');
  var chai = require('chai');
  var expect = chai.expect;
  var Gremlin = require('gremlin-v3');
  var gremlin = new Gremlin();
  var gremlinGraphviz = require('../lib/index.js');
  var heredoc = require('heredoc');
  var Q = require('q');
  var xmldom = require('xmldom');
  var xpath = require('xpath');

  it ('loads via require', function () {
  });

  it ('exports a function', function () {
    expect(gremlinGraphviz).to.be.ok;
    expect(_.isFunction(gremlinGraphviz)).to.be.true;
  });

  // ## with empty graph as input
  // Tests using an empty in-memory TinkerGraph database instance.
  describe ('with empty graph as input', function () {

    var TinkerGraph = gremlin.java.import('com.tinkerpop.gremlin.tinkergraph.structure.TinkerGraph');

    var javaGraph;
    var graph;

    before(function () {
      javaGraph = TinkerGraph.openSync();
      expect(javaGraph).to.be.ok;
      graph = gremlin.wrap(javaGraph);
      expect(graph).to.be.ok;
    });

    after(function (done) {
      graph = null;
      if (javaGraph) {
        javaGraph.close(function() {
          javaGraph = null;
          done();
        });
      }
    });

    it ('test harness should initialize', function () {
    });

    it ('returns a promise', function () {
      var promise = gremlinGraphviz(graph);
      expect(Q.isPromise(promise)).to.be.true;
    });

    it ('accepts promises', function (done) {
      gremlinGraphviz(Q(graph), Q({}))
        .then(function (g) {
          expect(g).to.be.ok;
        })
        .done(done);
    });

    it ('returns a digraph', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.type).to.equal('digraph');
        })
        .done(done);
    });

    it ('returns a graph with a default ID', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.id).to.equal('G');
        })
        .done(done);
    });

    it ('contains no vertices and edges', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.nodeCount()).to.equal(0);
          expect(g.edgeCount()).to.equal(0);
        })
        .done(done);
    });

    it ('can be rendered as dot', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.to_dot()).to.equal('digraph G {\n}\n');
        })
        .done(done);
    });
  });

  // ## with classic graph as input
  // Tests using the classic in-memory TinkerGraph database instance.
  describe ('with classic graph as input', function () {

    var TinkerFactory = gremlin.java.import('com.tinkerpop.gremlin.tinkergraph.structure.TinkerFactory');

    var javaGraph;
    var graph;

    before(function () {
      javaGraph = TinkerFactory.createClassicSync();
      expect(javaGraph).to.be.ok;
      graph = gremlin.wrap(javaGraph);
      expect(graph).to.be.ok;
    });

    after(function (done) {
      graph = null;
      if (javaGraph) {
        javaGraph.close(function() {
          javaGraph = null;
          done();
        });
      }
    });

    it ('test harness should initialize', function () {
    });

    it ('contains vertices and edges', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.nodeCount()).to.equal(6);
          expect(g.edgeCount()).to.equal(6);
          expect(g.getNode('1').id).to.equal('1');
        })
        .done(done);
    });

    it ('can be rendered as dot', function (done) {
      var expected = heredoc(function () {/*
digraph G {
  "1";
  "2";
  "3";
  "4";
  "5";
  "6";
  "1" -> "2";
  "1" -> "4";
  "1" -> "3";
  "4" -> "5";
  "4" -> "3";
  "6" -> "3";
}
*/});

      gremlinGraphviz(graph)
        .then(function (g) {
          expect(g.to_dot()).to.equal(expected);
        })
        .done(done);
    });

    it ('can be rendered as force-directed graph in SVG', function (done) {
      gremlinGraphviz(graph)
        .then(function (g) {
          g.use = 'fdp';
          g.output('svg', function (svgData) {

            // Parse DOM of SVG data.
            var svgDoc = new xmldom.DOMParser().parseFromString(svgData.toString());
            expect(svgDoc).to.be.ok;

            // Check that we have an ellipse for each vertex.
            var ellipses = findNodes('ellipse', svgDoc);
            expect(ellipses).to.be.ok;
            expect(ellipses.length).to.equal(6);

            // Check that we have a path for each edge.
            var paths = findNodes('path', svgDoc);
            expect(paths).to.be.ok;
            expect(paths.length).to.equal(6);

            done();
          }, function (code, out, err) {
            done('Code: ' + code + '\nError:' + err);
          });
        });
    });

  });

  // Find XML nodes with specific local name.
  var findNodes = function (localName, doc) {
    return xpath.select("//*[local-name(.)='" + localName + "']", doc);
  };
});
