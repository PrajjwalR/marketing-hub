import { fabric } from "fabric";

/**
 * Professional Smart Guidelines for Fabric.js
 * Handles snapping to objects and workspace margins with dashed visual feedback.
 */
export function initAligningGuidelines(canvas: fabric.Canvas) {
  // Lazily fetch the selection context so we don't hold a stale/null reference
  const getCtx = () => canvas.getSelectionContext();
  const aligningLineOffset = 5; // Snapping threshold in pixels
  const aligningLineMargin = 4;
  const aligningLineWidth = 1;
  const aligningLineColor = "rgb(168, 85, 247)"; // Purple-500
  
  let viewportTransform: any;
  let zoom = 1;

  function drawVerticalLine(coords: number) {
    drawLine(coords + 0.5, 0, coords + 0.5, canvas.height! / zoom);
  }

  function drawHorizontalLine(coords: number) {
    drawLine(0, coords + 0.5, canvas.width! / zoom, coords + 0.5);
  }

  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.setLineDash([4, 4]); // Professional dashed style
    ctx.beginPath();
    ctx.moveTo(
      (x1 + viewportTransform[4] / zoom) * zoom,
      (y1 + viewportTransform[5] / zoom) * zoom
    );
    ctx.lineTo(
      (x2 + viewportTransform[4] / zoom) * zoom,
      (y2 + viewportTransform[5] / zoom) * zoom
    );
    ctx.stroke();
    ctx.restore();
  }

  function isInRange(value1: number, value2: number) {
    return Math.abs(value1 - value2) <= aligningLineOffset;
  }

  const verticalLines: any[] = [];
  const horizontalLines: any[] = [];

  canvas.on("mouse:down", () => {
    viewportTransform = canvas.viewportTransform!;
    zoom = canvas.getZoom();
  });

  canvas.on("object:moving", (e) => {
    const activeObject = e.target;
    if (!activeObject) return;

    // Use getObjects() but filtered for visibility and specifically including the workspace (clip)
    const canvasObjects = canvas.getObjects().filter((obj) => {
      return (
        obj.visible && 
        obj !== activeObject && 
        (obj.name === "clip" || obj.name !== "background_image")
      );
    });

    const activeObjectCenter = activeObject.getCenterPoint();
    const activeObjectLeft = activeObjectCenter.x;
    const activeObjectTop = activeObjectCenter.y;
    const activeObjectBoundingRect = activeObject.getBoundingRect();
    const activeObjectHeight = activeObjectBoundingRect.height / canvas.getZoom();
    const activeObjectWidth = activeObjectBoundingRect.width / canvas.getZoom();

    let horizontalInTheRange = false;
    let verticalInTheRange = false;

    // Refresh transform and zoom
    viewportTransform = canvas.viewportTransform!;
    zoom = canvas.getZoom();

    verticalLines.length = horizontalLines.length = 0;

    for (let i = canvasObjects.length; i--; ) {
      const obj = canvasObjects[i];
      const objectCenter = obj.getCenterPoint();
      const objectLeft = objectCenter.x;
      const objectTop = objectCenter.y;
      const objectBoundingRect = obj.getBoundingRect();
      const objectHeight = objectBoundingRect.height / canvas.getZoom();
      const objectWidth = objectBoundingRect.width / canvas.getZoom();

      // --- Vertical Snapping (X Axis) ---

      // Snap Center-to-Center
      if (isInRange(activeObjectLeft, objectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({ x: objectLeft });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft, activeObjectTop),
          "center",
          "center"
        );
      }

      // Snap Left-to-Left
      if (isInRange(activeObjectLeft - activeObjectWidth / 2, objectLeft - objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({ x: objectLeft - objectWidth / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop),
          "center",
          "center"
        );
      }

      // Snap Right-to-Right
      if (isInRange(activeObjectLeft + activeObjectWidth / 2, objectLeft + objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({ x: objectLeft + objectWidth / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop),
          "center",
          "center"
        );
      }

      // Snap Right-to-Left (Adjacency)
      if (isInRange(activeObjectLeft + activeObjectWidth / 2, objectLeft - objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({ x: objectLeft - objectWidth / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft - objectWidth / 2 - activeObjectWidth / 2, activeObjectTop),
          "center",
          "center"
        );
      }

      // Snap Left-to-Right (Adjacency)
      if (isInRange(activeObjectLeft - activeObjectWidth / 2, objectLeft + objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({ x: objectLeft + objectWidth / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft + objectWidth / 2 + activeObjectWidth / 2, activeObjectTop),
          "center",
          "center"
        );
      }

      // --- Horizontal Snapping (Y Axis) ---

      // Snap Center-to-Center
      if (isInRange(activeObjectTop, objectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({ y: objectTop });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop),
          "center",
          "center"
        );
      }

      // Snap Top-to-Top
      if (isInRange(activeObjectTop - activeObjectHeight / 2, objectTop - objectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({ y: objectTop - objectHeight / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2),
          "center",
          "center"
        );
      }

      // Snap Bottom-to-Bottom
      if (isInRange(activeObjectTop + activeObjectHeight / 2, objectTop + objectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({ y: objectTop + objectHeight / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2),
          "center",
          "center"
        );
      }

      // Snap Bottom-to-Top (Adjacency)
      if (isInRange(activeObjectTop + activeObjectHeight / 2, objectTop - objectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({ y: objectTop - objectHeight / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 - activeObjectHeight / 2),
          "center",
          "center"
        );
      }

      // Snap Top-to-Bottom (Adjacency)
      if (isInRange(activeObjectTop - activeObjectHeight / 2, objectTop + objectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({ y: objectTop + objectHeight / 2 });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 + activeObjectHeight / 2),
          "center",
          "center"
        );
      }
    }

    if (!horizontalInTheRange) horizontalLines.length = 0;
    if (!verticalInTheRange) verticalLines.length = 0;

    activeObject.setCoords();
    canvas.requestRenderAll();
  });

  canvas.on("before:render", () => {
    const selCtx = canvas.getSelectionContext();
    if (selCtx) canvas.clearContext(selCtx);
  });

  canvas.on("after:render", () => {
    for (let i = verticalLines.length; i--; ) {
      drawVerticalLine(verticalLines[i].x);
    }
    for (let i = horizontalLines.length; i--; ) {
      drawHorizontalLine(horizontalLines[i].y);
    }
    // Note: Do NOT clear the lines array here, wait for the next render or mouse:up
  });

  canvas.on("mouse:up", () => {
    verticalLines.length = horizontalLines.length = 0;
    const selCtx = canvas.getSelectionContext();
    if (selCtx) canvas.clearContext(selCtx);
    canvas.requestRenderAll();
  });
}
