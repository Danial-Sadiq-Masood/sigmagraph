import Sigma from "sigma";
import { EdgeLineProgram, EdgeRectangleProgram, EdgeArrowProgram } from "sigma/rendering";
import EdgeCurveProgram from "@sigma/edge-curve";

import { DEFAULT_EDGE_CURVATURE, EdgeCurvedArrowProgram, indexParallelEdgesIndex } from "@sigma/edge-curve";

import { createNodeImageProgram } from "@sigma/node-image";

import { TEXT_COLOR } from "./viz_defaults";

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

export function createRenderer(graph, container) {
    return new Sigma(
        graph,
        container,
        {
            defaultDrawNodeLabel: drawLabel,
            labelWeight: 500,
            labelSize: 15,
            labelRenderedSizeThreshold: 13,
            defaultDrawNodeHover: drawHover,
            labelFont: "Ubuntu, sans-serif",
            renderEdgeLabels: true,
            edgeLabelSize: 10,
            edgeLabelSizePowRatio: 0.6,
            defaultEdgeType: "straight",
            edgeProgramClasses: {
                straight: EdgeArrowProgram,
                curved: EdgeCurvedArrowProgram
            },
            nodeProgramClasses: {
                image: createNodeImageProgram({
                    size: { mode: "force", value: 256 },
                })
            }
        }
    );
}