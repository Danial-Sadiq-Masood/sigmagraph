import res from "./res.json"

import Graph from 'graphology';
import Sigma from "sigma";

import { random, circular, circlepack } from 'graphology-layout';

import forceAtlas2 from 'graphology-layout-forceatlas2';
import forceLayout from 'graphology-layout-force';

import EdgeCurveProgram from "@sigma/edge-curve";

import clusters from "graphology-generators/random/clusters";
import seedrandom from "seedrandom";

import { EdgeLineProgram, EdgeRectangleProgram } from "sigma/rendering";

import { nodeExtent, edgeExtent } from 'graphology-metrics/graph';

window.res = res;

const TEXT_COLOR = "#b186f7";

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

const graph = new Graph({ multi: true });

window.graph = graph;

res.graph.nodes.forEach((d, i) => {
  graph.addNode(d._id, {
    ...d.source, _cc: d._cc, label: d.source.name,
    size: i == 0 ? 20 : 10,
    degree: i == 0 ? 0 : 1,
    color: i == 0 ? '#0000b7' : '#9960f7'
  })
})

Object.entries(res.graph.connections).forEach(
  ([sourceIndex, connectionsArr]) => {
    const source = res.graph.nodes[sourceIndex]
    connectionsArr.forEach(([targetIndex, edgeIndex]) => {
      const target = res.graph.nodes[targetIndex]
      const edge = res.graph.edges[edgeIndex]
      edge.size = 2;
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

const positions = circular(graph, { dimensions: [1000, 1000] });

random.assign(graph);

const positionsForced = forceLayout(graph, { maxIterations: 50 });

circlepack.assign(graph, {
  hierarchyAttributes: ['degree']
});


const renderer = new Sigma(
  graph,
  document.getElementById("app"),
  {
    defaultDrawNodeLabel: drawLabel,
    labelWeight: 500,
    labelSize: 15,
    labelRenderedSizeThreshold: 10,
    defaultDrawNodeHover: drawHover,
    labelFont: "Ubuntu, sans-serif",
    renderEdgeLabels: true,
    edgeLabelSize: 10,
    defaultEdgeType: "arrow",
    edgeLabelSizePowRatio: 0.6,
    edgeProgramClasses: {
      curved: EdgeCurveProgram,
    }
  }
);

window.renderer = renderer;

function drawLabel(
  context,
  data,
  settings,
) {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = TEXT_COLOR;
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}

function drawRoundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}


function drawHover(context, data, settings) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;

  const label = data.label;
  //const subLabel = data.tag !== "unknown" ? data.tag : "";
  //const clusterLabel = data.clusterLabel;

  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#dcdcdc";

  context.font = `${weight} ${size}px ${font}`;
  const labelWidth = context.measureText(label).width;
  //context.font = `${weight} ${subLabelSize}px ${font}`;
  //const subLabelWidth = subLabel ? context.measureText(subLabel).width : 0;
  //context.font = `${weight} ${subLabelSize}px ${font}`;
  //const clusterLabelWidth = clusterLabel ? context.measureText(clusterLabel).width : 0;

  const textWidth = labelWidth//Math.max(labelWidth, subLabelWidth, clusterLabelWidth);

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + size / 2 + data.size + 3);
  const hLabel = Math.round(size / 2 + 4);
  //const hSubLabel = subLabel ? Math.round(subLabelSize / 2 + 9) : 0;
  //const hClusterLabel = Math.round(subLabelSize / 2 + 9);

  drawRoundRect(context, x, y - 12, w, hLabel + 12, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels
  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, data.x + data.size + 3, data.y + size / 3);

  /*if (subLabel) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(subLabel, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);
  }*/

  context.fillStyle = data.color;
  /*context.font = `${weight} ${subLabelSize}px ${font}`;
  context.fillText(clusterLabel, data.x + data.size + 3, data.y + size / 3 + 3 + subLabelSize);*/
}

let draggedNode = null;
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

const state = { searchQuery: "" };

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
});

renderer.setSetting("nodeReducer", (node, data) => {
  const res = { ...data };

  if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
    res.label = "";
    res.color = "#f6f6f6";
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
  const res = { ...data };

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
  })*/

  const clickedPoint = renderer.viewportToGraph({ x: event.x, y: event.y });

  const new_graph = generateGraph(clickedPoint);


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
}