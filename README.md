gremlin-graphviz
================

Use Graphviz to visualize Gremlin graphs.

This module is a mashup of [gremlin-v3](https://github.com/jimlloyd/gremlin-v3) and
[node-graphviz](https://github.com/glejeune/node-graphviz).

## Usage

You must first install the Graphviz package in a platform-specific manner.

Check out the unit tests for more, but here is a taste:

```js
// Create a Gremlin graph with some data.
var Gremlin = require('gremlin-v3');
var gremlin = new Gremlin();
var TinkerFactory = gremlin.java.import('com.tinkerpop.gremlin.tinkergraph.structure.TinkerFactory');
var gremlinGraph = gremlin.wrap(TinkerFactory.createClassicSync());

// Create a Graphviz graph (promise) representing the Gremlin graph.
var gremlinGraphviz = require('gremlin-graphviz');
gremlinGraphviz(gremlinGraph).
  then(function (graphvizGraph) {

    // Create a dot representation (synchronous).
    var dotGraph = graphvizGraph.to_dot();

    // Create a force-directed graph PNG (async).
    graphvizGraph.use = 'fdp';
    graphvizGraph.output('png', function (data) {

      // Save it as a file.
      require('fs').writeFileSync('graph.png', data);

    }, function (code, stdout, stderr) {
      // If something goes wrong with the 'fdp' command...
      throw new Error('fdp failed: ' + stderr);
    });
  });
```
