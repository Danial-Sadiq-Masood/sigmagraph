import res from "./res1.json"

import Graph from 'graphology';

import { random, circular, circlepack } from 'graphology-layout';

import forceAtlas2 from 'graphology-layout-forceatlas2';
import forceLayout from 'graphology-layout-force';

import clusters from "graphology-generators/random/clusters";
import seedrandom from "seedrandom";

import { dfsFromNode } from 'graphology-traversal';

import { nodeExtent, edgeExtent } from 'graphology-metrics/graph';

import { Application, Assets, Sprite, Graphics, Text, GraphicsContext, Container } from 'pixi.js';

import { DEFAULT_EDGE_CURVATURE, EdgeCurvedArrowProgram, indexParallelEdgesIndex } from "@sigma/edge-curve";

import { createMachine, setup, createActor, assign } from 'xstate';

import { createRenderer } from './SigmaRenderer'

import bunnySprite from './images/bunny.png';

import estSprite from './images/est.png';

import userCircle from './images/user-circle.png';

import office from './images/office.png';

import noverlap from 'graphology-layout-noverlap';

const svgMap = new Map(
  [
    ['company', { url: office, color: '#e1e3e1' }],
    ['person', { url: userCircle, color: '#007AFF' }]
  ]
);

window.res = res;

const rng = seedrandom("sigma");

const DEFAULT_ARGS = {
  order: 5000,
  size: 1000,
  clusters: 3,
  edgesRenderer: "edges-default",
};


function generateGraph(clickedPoint) {

  const random_state = {
    ...DEFAULT_ARGS,
    order: Math.floor(Math.random() * 4000) + 1000,
    size: Math.floor(Math.random() * 4000) + 1000,
    clusters: 1,
    edgesRenderer: EdgeRectangleProgram
  };

  const graph = clusters(Graph, { ...random_state, rng });
  circular.assign(graph, {
    center: Math.random()
  });
  forceAtlas2.assign(graph, {
    iterations: 50,
    settings: {
      ...forceAtlas2.inferSettings(graph),
      gravity: 10,
      strongGravityMode: true
    }
  });
  const colors = {};
  for (let i = 0; i < +state.clusters; i++) {
    colors[i] = "#" + Math.floor(rng() * 16777215).toString(16);
  }
  let i = 0;
  graph.forEachNode((node, { cluster }) => {
    graph.mergeNodeAttributes(node, {
      label: `Node n°${++i}, in cluster n°${cluster}`,
      color: colors[cluster + ""],
      _id: crypto.randomUUID(),
      size: 4
    });
  });

  return graph;
}

window.generateGraph = generateGraph;


/*let draggedNode = null;
let isDragging = false;

// On mouse down on a node
//  - we enable the drag mode
//  - save in the dragged node in the state
//  - highlight the node
//  - disable the camera so its state is not updated
renderer.on("downNode", (e) => {
  isDragging = true;
  draggedNode = e.node;
  graph.setNodeAttribute(draggedNode, "highlighted", true);
  if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
});

// On mouse move, if the drag mode is enabled, we change the position of the draggedNode
renderer.on("moveBody", ({ event }) => {
  if (!isDragging || !draggedNode) return;

  // Get new position of node
  const pos = renderer.viewportToGraph(event);

  graph.setNodeAttribute(draggedNode, "x", pos.x);
  graph.setNodeAttribute(draggedNode, "y", pos.y);

  // Prevent sigma to move camera:
  event.preventSigmaDefault();
  event.original.preventDefault();
  event.original.stopPropagation();
});

// On mouse up, we reset the dragging mode
const handleUp = () => {
  if (draggedNode) {
    graph.removeNodeAttribute(draggedNode, "highlighted");
  }
  isDragging = false;
  draggedNode = null;
};
renderer.on("upNode", handleUp);
renderer.on("upStage", handleUp);

const state = { searchQuery: "", hidden: {} };

window.state = state;

function setHoveredNode(node) {
  if (node) {
    state.hoveredNode = node;
    state.hoveredNeighbors = new Set(graph.neighbors(node));
  }

  if (!node) {
    state.hoveredNode = undefined;
    state.hoveredNeighbors = undefined;
  }

  // Refresh rendering
  renderer.refresh({
    // We don't touch the graph data so we can skip its reindexation
    skipIndexation: true,
  });
}

renderer.on("enterNode", ({ node }) => {
  setHoveredNode(node);
});
renderer.on("leaveNode", () => {
  setHoveredNode(undefined);

  graph.forEachNode(nodeId => {
    const res = graph.getNodeAttributes(nodeId);
    res.sprite.renderable = true;
    res.textSprite.renderable = true;
    res.circleSprite.renderable = true;
  })
});

renderer.setSetting("nodeReducer", (node, data) => {

  if (state.hidden[node]) {
    return { ...data, hidden: true };
  }

  return data;
  /*const res = { ...data };

  if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
    res.label = "";
    res.color = "#f6f6f6";
    res.image = null;
    res.sprite.renderable = false;
    res.textSprite.renderable = false;
    res.circleSprite.renderable = false;
  }

  if (state.selectedNode === node) {
    res.highlighted = true;
  } else if (state.suggestions) {
    if (state.suggestions.has(node)) {
      res.forceLabel = true;
    } else {
      res.label = "";
      res.color = "#f6f6f6";
    }
  }

  return res;
});

renderer.setSetting("edgeReducer", (edge, data) => {
  /*if(isDragging){
    return {
      ...data,
      hidden : true
    }
  }

  return data;

  /*const res = { ...data };

  if (
    state.hoveredNode &&
    !graph.extremities(edge).every((n) => n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode))
  ) {
    res.hidden = true;
  }

  if (
    state.suggestions &&
    (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
  ) {
    res.hidden = true;
  }

  return res;
});

renderer.on("doubleClickNode", ({ event, node: clickedNode }) => {
  console.log(event)
  event.preventSigmaDefault();
  // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
  // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
  /*const coordForGraph = renderer.viewportToGraph({ x: event.x, y: event.y });


  // We create a new node
  const nodes = new Array(1000).fill(null).map(_ => ({
    _id: crypto.randomUUID(),
    ...coordForGraph,
    size: 10,
    color: 'red',
  }));

  const new_graph = new Graph({ multi: true });

  nodes.forEach(d => new_graph.addNode(d._id, d));

  nodes.slice(1).forEach(d => new_graph.addEdge(nodes[0]._id, d._id));

  console.log(new_graph);

  random.assign(new_graph);

  forceAtlas2.assign(new_graph, { iterations: 50 });

  const bbox = renderer.getBBox();

  const nodesArr = Array.from(new_graph.nodeEntries())

  nodesArr.forEach(({ attributes }) => {
    const dflx = Math.abs(attributes.x - bbox.x[0]);
    attributes.x = attributes.x - dflx - Math.abs(attributes.x) - 2;
  })

  const clickedPoint = renderer.viewportToGraph({ x: event.x, y: event.y });

  const new_graph = generateGraph(clickedPoint);

  addSprite(new_graph, window.app)

  const bbox = renderer.getBBox();


  const closestEdge = getClosestEdge(bbox,
    clickedPoint
  )

  console.log('closest edge -> ', closestEdge)

  console.log(bbox);

  translatePoints(new_graph, closestEdge, bbox)

  const nodesArr = Array.from(new_graph.nodeEntries())

  const node = nodesArr[0].attributes;


  // Searching the two closest nodes to auto-create an edge to it

  console.log(nodesArr);

  const nodes = nodesArr.map(d => d.attributes)

  console.log(nodes)

  // We register the new node into graphology instance
  const id = node._id;
  nodes.forEach(d => graph.addNode(d._id, d));

  nodes.slice(1).forEach(d => graph.addEdge(nodes[0]._id, d._id));

  // We create the edges
  graph.addEdge(id, clickedNode);
});

function getClosestEdge(bbox, eventCoords) {
  const distanceFromLeftX = Math.round(Math.abs(eventCoords.x - bbox.x[0]));
  const distanceFromRightX = Math.round(Math.abs(bbox.x[1] - eventCoords.x));
  const distanceFromBottomY = Math.round(Math.abs(eventCoords.y - bbox.y[0]));
  const distanceFromTopY = Math.round(Math.abs(bbox.y[1] - eventCoords.y));

  const distToLabel = {
    [distanceFromLeftX]: 'LEFT',
    [distanceFromRightX]: 'RIGHT',
    [distanceFromBottomY]: 'BOTTOM',
    [distanceFromTopY]: 'TOP'
  }

  const minDistance = Math.min(
    distanceFromLeftX,
    distanceFromRightX,
    distanceFromBottomY,
    distanceFromTopY
  )

  return {
    direction: distToLabel[minDistance],
    distance: minDistance
  };
}

function translatePoints(graph, translationSettings, bbox) {
  const xyExtent = nodeExtent(graph, ['x', 'y']);
  console.log(xyExtent, 'xyextent')
  const nodesArr = Array.from(graph.nodeEntries())

  if (translationSettings.direction == 'LEFT') {
    const randomY = Math.floor(Math.random() * 150)
    const randomDirection = Math.random() > 0.5 ? -1 : 1

    nodesArr.forEach(({ attributes }) => {
      const max_dist = bbox.x[0] - xyExtent.x[1];
      attributes.x = attributes.x + max_dist - 3;
      attributes.y = attributes.y + (randomY * randomDirection);
    })
  }
  else if (translationSettings.direction == 'RIGHT') {
    const randomY = Math.floor(Math.random() * 150)
    const randomDirection = Math.random() > 0.5 ? -1 : 1

    nodesArr.forEach(({ attributes }) => {
      const max_dist = bbox.x[1] - xyExtent.x[0];
      attributes.x = attributes.x + max_dist + 3;
      attributes.y = attributes.y + (randomY * randomDirection);
    })
  }
  else if (translationSettings.direction == 'TOP') {
    const randomx = Math.floor(Math.random() * 150)
    const randomDirection = Math.random() > 0.5 ? -1 : 1

    nodesArr.forEach(({ attributes }) => {
      const max_dist = bbox.y[1] - xyExtent.y[0];
      attributes.y = attributes.y + max_dist + 3;
      attributes.x = attributes.x + (randomx * randomDirection);
    })
  }
  else if (translationSettings.direction == 'BOTTOM') {
    const randomx = Math.floor(Math.random() * 150)
    const randomDirection = Math.random() > 0.5 ? -1 : 1

    nodesArr.forEach(({ attributes }) => {
      const max_dist = xyExtent.y[1] - bbox.y[0];
      attributes.y = attributes.y - max_dist - 3;
      attributes.x = attributes.x + (randomx * randomDirection);
    })
  }
}*/


const flagsTextureMap = {

}

class GraphViz {
  constructor(container, graph, renderer, options) {
    this.container = container;
    this.graph = graph;
    this.renderer = renderer;
    this.options = options;
    this.actor = null;

    this.collapsedNodes = [];
    this.displayedNodes = new Set(graph.nodes());

    this.setDefaultNodeReducer();

    this.pixiLayer = new PixiLayer(graph, container, renderer);

  }

  setUpListeners(actor) {

    this.renderer
      .on("enterNode", ({ node }) => {
        actor.send({
          type: 'HOVER_START',
          data: [node]
        })
      });

    this.renderer
      .on("leaveNode", ({ node }) => {
        actor.send({
          type: 'HOVER_END'
        })
      });

    this.renderer
      .on("downNode", (event) => {
        console.log(event);
        actor.send({
          type: 'NODE_DOWN',
          data: event
        })
      });

    this.renderer.on("moveBody", ({ event }) => {
      actor.send({
        type: 'MOVE_BODY',
        data: event
      })
    })

    this.renderer.on("upNode", ({ event }) => {
      actor.send({
        type: 'MOUSE_UP',
        data: event
      })
    })

    this.renderer.on("upStage", ({ event }) => {
      actor.send({
        type: 'MOUSE_UP',
        data: event
      })
    })

  }

  getNodesToHighlight(nodesSet) {
    const graph = this.graph;

    const selectNodesArr = Array.from(nodesSet.keys())

    const highLightedNodesNeighbors = selectNodesArr.reduce(
      (acc, d) => {
        graph.neighbors(d)
          .forEach(e => {
            acc.add(e);
          })
        return acc;
      }, new Set());

    const nodesToHighlight = new Set(
      Array.from(nodesSet.keys())
        .concat(
          Array.from(highLightedNodesNeighbors.keys()
          )
        )
    );

    if (this.displayedNodes) {
      Array.from(nodesToHighlight.keys())
        .forEach(
          d => {
            if (!this.displayedNodes.has(d)) {
              nodesToHighlight.delete(d)
            }
          }
        )
    };

    return nodesToHighlight;
  }

  highlightNodes(nodesSet) {

    const graph = this.graph;

    const nodesToHighlight = this.getNodesToHighlight(nodesSet);

    this.renderer.setSetting("nodeReducer", (node, data) => {

      const res = { ...data };

      if (!nodesToHighlight.has(node)) {
        res.label = "";
        res.color = "#f6f6f6";
        res.image = null;
        res.hidden = true;
        this.pixiLayer.hideSprite(res);
      }

      if (nodesToHighlight.has(node)) {
        res.forceLabel = true;
      } else {
        res.label = "";
      }

      return res;
    });

    this.renderer.setSetting("edgeReducer", (edge, data) => {
      /*if (isDragging) {
        return {
          ...data,
          hidden: true
        }
      }*/

      const res = { ...data };

      const nodes = graph.extremities(edge);

      if (
        (nodesToHighlight.has(nodes[0]) && nodesToHighlight.has(nodes[1]))
      ) {
        res.forceLabel = true;
        return res
      }

      res.hidden = true;
      return res;

      /*if (
      !graph.extremities(edge).every((n) => n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode))
    ) {
      res.hidden = true;
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
    ) {
      res.hidden = true;
    }*/
    });
  }

  initNodeDrag(draggedNode) {
    let index = 0;
    this.graph.updateEachNodeAttributes((nodeId, attr) => {
      return { ...attr, zIndex: index++ }
    })

    this.graph.setNodeAttribute(draggedNode, "zIndex", index + 100);
  }

  dragNode(draggedNode, event) {
    const renderer = this.renderer;
    const graph = this.graph;

    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());

    const pos = renderer.viewportToGraph(event);

    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);

    // Prevent sigma to move camera:
    event.preventSigmaDefault();
    event.original.preventDefault();
    event.original.stopPropagation();
  }

  refreshSigma() {
    this.renderer.scheduleRefresh({
      layoutUnchange: true
    })
  }

  setDefaultNodeReducer() {
    this.renderer.setSetting("nodeReducer", (node, data) => {
      if (!this.displayedNodes.has(node)) {
        this.pixiLayer.hideSprite(data);
        return { ...data, hidden: true }
      } else {
        return data;
      }
    })
  }

  setDefaultEdgeReducer() {
    this.renderer.setSetting("edgeReducer", (edge, data) => {
      return data;
    })
  }

  removeHighlight() {
    //this.highlightedNodes = null;

    this.graph.forEachNode((nodeID, attr) => {
      this.pixiLayer.showSprite(attr);
    })

    this.setDefaultNodeReducer();
    this.setDefaultEdgeReducer();
  }
}

class PixiLayer {
  constructor(graph, container, renderer) {
    this.graph = graph;
    this.container = container;
    this.renderer = renderer;
  }

  async initPixiLayer() {
    // Create a PixiJS application.
    const app = new Application();
    this.pixiApp = app;

    // Intialize the application.
    const texture = await Assets.load(estSprite);
    this.texture = texture;
    await app.init({ backgroundAlpha: 0, resizeTo: window });

    // Then adding the application's canvas to the DOM body.
    const container = this.container;
    const graph = this.graph;
    const renderer = this.renderer;

    this.addSprites()

    app.canvas.style.position = 'absolute';

    container
      .insertBefore(app.canvas, container.querySelector(".sigma-labels"));

    renderer.on("afterRender", () => {

      const scale = renderer.scaleSize(1);

      Array.from(graph.nodeEntries()).forEach(({ attributes: d }) => {
        this.syncSpriteToSigma(d, scale);
      })
    });
  }

  addSprites() {

    const graph = this.graph;
    const app = this.pixiApp;
    const renderer = this.renderer;
    const texture = this.texture;

    let circleContext = new GraphicsContext()
      .circle(0, 0, 6)
      .fill('red')

    let rectContext = new GraphicsContext()
      .rect(0, 0, 140, 140)
      .fill('red')


    Array.from(graph.nodeEntries()).forEach(({ attributes: d }) => {

      const nodeContainer = new Container();

      const sprite = new Sprite(texture);

      sprite.anchor.set(0.5);
      app.stage.addChild(sprite);

      d.sprite = sprite;

      const coords = renderer.graphToViewport({ x: d.x, y: d.y })
      sprite.x = coords.x;
      sprite.y = coords.y;
      sprite.width = 10;
      sprite.height = 5;

      const rectSprite = new Graphics(rectContext);

      rectSprite.x = coords.x;
      rectSprite.y = coords.y;

      d.rectSprite = rectSprite;

      app.stage.addChild(rectSprite);

      const text = new Text(d.outgoingEdgeCount,
        {
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          fontSize: 7
        }
      );

      d.textSprite = text;

      text.anchor.set(0.5);
      text.x = coords.x;
      text.y = coords.y;

      app.stage.addChild(text);
    })
  }

  syncSpriteToSigma(graphologyNode, scale) {

    const distance = 12;

    const renderer = this.renderer;

    const coords = renderer.graphToViewport({ x: graphologyNode.x, y: graphologyNode.y })
    graphologyNode.sprite.x = coords.x - renderer.scaleSize(distance);
    graphologyNode.sprite.y = coords.y - renderer.scaleSize(distance);

    graphologyNode.sprite.width = 10 * scale;
    graphologyNode.sprite.height = 5 * scale;

    graphologyNode.rectSprite.x = coords.x - renderer.scaleSize(70);
    graphologyNode.rectSprite.y = coords.y - renderer.scaleSize(70);;

    graphologyNode.rectSprite.width = 140 * scale;
    graphologyNode.rectSprite.height = 140 * scale;

    graphologyNode.textSprite.x = coords.x + renderer.scaleSize(distance);
    graphologyNode.textSprite.y = coords.y - renderer.scaleSize(distance);

    graphologyNode.textSprite.style.fontSize = 7 * scale;
  }

  hideSprite(attr) {
    attr.sprite.renderable = false;
    attr.textSprite.renderable = false;
  }

  showSprite(attr) {
    attr.sprite.renderable = true;
    attr.textSprite.renderable = true;
  }

}

function getCurvature(index, maxIndex) {
  if (maxIndex <= 0) throw new Error("Invalid maxIndex");
  if (index < 0) return -getCurvature(-index, maxIndex);
  const amplitude = 3.5;
  const maxCurvature = amplitude * (1 - Math.exp(-maxIndex / amplitude)) * DEFAULT_EDGE_CURVATURE;
  return (maxCurvature * index) / maxIndex;
}

//graph creation

function createGraphFromAPI(graphData) {

  const graph = new Graph({ multi: true });

  const nodes = graphData.nodes;
  const edges = graphData.edges;
  const connections = graphData.connections;

  //add nodes
  nodes.forEach((d, i) => {

    const outgoingEdgeCount = connections[i];

    graph.addNode(d._id, {
      ...d.source,
      _cc: d._cc,
      //label: d.source.name,
      size: 140,
      outgoingEdgeCount: outgoingEdgeCount ? outgoingEdgeCount.length : 0,
      type: "square",
      //image: svgMap.get(d.source.context).url,
      color: "white"
    })
  })

  //add edges
  Object.entries(connections).forEach(
    ([sourceIndex, connectionsArr]) => {
      const source = nodes[sourceIndex]
      connectionsArr.forEach(([targetIndex, edgeIndex]) => {
        const target = nodes[targetIndex]
        const edge = edges[edgeIndex]
        edge.size = 1;
        edge.label = edge.source.sub_context_label;
        try {
          graph.addDirectedEdge(source._id, target._id, edge)
        } catch (error) {
          console.log(error);
          console.log(sourceIndex, [targetIndex, edgeIndex])
        };
      })
    }
  )

  indexParallelEdgesIndex(graph, {
    edgeIndexAttribute: "parallelIndex",
    edgeMinIndexAttribute: "parallelMinIndex",
    edgeMaxIndexAttribute: "parallelMaxIndex",
  });

  // Adapt types and curvature of parallel edges for rendering:
  graph.forEachEdge(
    (
      edge,
      {
        parallelIndex,
        parallelMinIndex,
        parallelMaxIndex,
      }
    ) => {
      if (typeof parallelMinIndex === "number") {
        graph.mergeEdgeAttributes(edge, {
          type: parallelIndex ? "curved" : "straight",
          curvature: getCurvature(parallelIndex, parallelMaxIndex),
        });
      } else if (typeof parallelIndex === "number") {
        graph.mergeEdgeAttributes(edge, {
          type: "curved",
          curvature: getCurvature(parallelIndex, parallelMaxIndex),
        });
      } else {
        graph.setEdgeAttribute(edge, "type", "straight");
      }
    },
  );

  //assign random coordinates for forceAtlas2
  random.assign(graph, {
  });

  const sensibleSettings = forceAtlas2.inferSettings(graph);

  //run forceAtlas2
  circlepack.assign(graph, {
    hierarchyAttributes: ["context"]
  });

  /*forceLayout.assign(graph, {
    maxIterations : 100,
    settings : {
      inertia : 0,
      repulsion : 1,
      maxMove : 500
    }
  })*/

  /*noverlap.assign(graph)*/;

  graph.updateEachNodeAttributes((node, attr) => {
    return { ...attr, size: 70 }
  });

  return graph;
}

function createVizStateChart(initialData, container) {

  const graph = createGraphFromAPI(initialData);
  const renderer = createRenderer(graph, container);

  const graphViz = new GraphViz(container, graph, renderer);

  window.graphViz = graphViz;

  const graphStateChart = setup({
    actions: {
      'initViz': ({ context, self }) => {
        console.log('initializing viz');

        context.graphViz.pixiLayer.initPixiLayer();
        context.graphViz.setUpListeners(self);

        self.send({
          type: 'INITIALIZED'
        })
      },
      'highlightNode': ({ context, self, event }) => {
        console.log('highlighting action', event.data);
        context.graphViz.highlightNodes(new Set(event.data))
      },
      'removeHighlight': ({ context, self, event }) => {
        console.log('remove highlight');
        context.graphViz.removeHighlight();
      },
      'updateDisplayedNodes': ({ context, self, event }) => {
        console.log('transition to highlighted state', event.data);
        context.graphViz.displayedNodes = new Set(event.data);
        context.graphViz.refreshSigma();
      },
      'dragNode': ({ context, self, event }) => {
        console.log('in drag node');
        console.log(context, event.data);
        context.graphViz.initNodeDrag(context.draggedNode);
        context.graphViz.dragNode(context.draggedNode, event.data);
      }
    }
  })
    .createMachine({
      id: 'graphviz',
      context: {
        graphViz: graphViz
      },
      initial: 'init',
      states: {
        'init': {
          entry: {
            type: 'initViz'
          },
          on: {
            'INITIALIZED': {
              target: '#idle'
            }
          }
        },
        'idle': {
          id: 'idle',
          on: {
            'HOVER_START': {
              target: '#hovered.node'
            },
            'CHANGE_DISPLAYED_NODES': {
              target: '#idle',
              actions: [{
                type: 'updateDisplayedNodes'
              }]
            }
          }
        },
        'hovered': {
          id: 'hovered',
          initial: 'node',
          states: {
            'node': {
              entry: {
                type: 'highlightNode'
              },
              on: {
                'HOVER_END': {
                  target: '#idle',
                },
                'NODE_DOWN': {
                  target: '#dragging',
                },
              },
              exit: {
                type: 'removeHighlight'
              }
            }
          }
        },
        'dragging': {
          id: 'dragging',
          entry: [
            assign(
              {
                draggedNode: ({ event }) => event.data.node
              }
            ),
            (e) => console.log(e)
          ],
          exit: assign({
            draggedNode: undefined
          }),
          on: {
            'MOVE_BODY': {
              actions: {
                type: 'dragNode'
              }
            },
            'MOUSE_UP': {
              target: 'idle'
            }
          }
        }
      }
    })

  const actor = createActor(graphStateChart);

  window.actor = actor;

  actor.start();
}

createVizStateChart(res.graph, document.getElementById("app"))

window.dfsFromNode = dfsFromNode;

