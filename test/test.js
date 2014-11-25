// test/test.js
// Unit tests for gremlin-graphviz.

describe ('gremlin-graphviz', function () {

  var _ = require('lodash');
  var chai = require('chai');
  var expect = chai.expect;
  var gremlin = require('gremlin-v3');
  var gremlinGraphviz = require('../lib/index.js');
  var Q = require('q');

  it ('loads via require', function () {
  });

  it ('exports a function', function () {
    expect(gremlinGraphviz).to.be.ok;
    expect(_.isFunction(gremlinGraphviz)).to.be.true;
  });

  it ('returns a promise', function () {
    var promise = gremlinGraphviz();
    expect(Q.isPromise(promise)).to.be.true;
  });

  it ('accepts promises', function (done) {
    gremlinGraphviz(Q(null), Q({}))
      .then(function (g) {
        expect(g).to.be.ok;
      })
      .done(done);
  });

  it ('returns a digraph', function (done) {
    gremlinGraphviz()
      .then(function (g) {
        expect(g.type).to.equal('digraph');
      })
      .done(done);
  });

  it ('returns a graph with a default ID', function (done) {
    gremlinGraphviz()
      .then(function (g) {
        expect(g.id).to.equal('G');
      })
      .done(done);
  });
});
