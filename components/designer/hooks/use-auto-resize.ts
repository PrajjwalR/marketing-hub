import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  const autoZoom = useCallback(() => {
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    canvas.setWidth(width);
    canvas.setHeight(height);
    
    // If there are no objects at all, do nothing.
    if (canvas.getObjects().length === 0) {
      canvas.setViewportTransform(fabric.iMatrix.concat()); // Reset zoom/pan
      canvas.requestRenderAll();
      return;
    }

    const center = canvas.getCenter();
    const zoomRatio = 0.85;

    // Find the 'clip' object or create a fallback
    let workspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");
      

    if (!workspace) {
      // If no 'clip' object, create a group of all objects to act as the workspace
      workspace = new fabric.Group(canvas.getObjects(), {
        canvas: canvas,
      });
    }

    // @ts-ignore
    const scale = fabric.util.findScaleToFit(workspace, {
      width: width,
      height: height,
    });

    const zoom = zoomRatio * scale;

    canvas.setViewportTransform(fabric.iMatrix.concat());
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

    const workspaceCenter = workspace.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (
      canvas.width === undefined ||
      canvas.height === undefined ||
      !viewportTransform
    ) {
      return;
    }

    // Center the workspace in the view
    viewportTransform[4] = canvas.width / 2 - workspaceCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - workspaceCenter.y * viewportTransform[3];
    canvas.setViewportTransform(viewportTransform);

    // Only apply clipPath if the original "clip" object exists
    const clipObject = canvas
      .getObjects()
      .find((object) => object.name === "clip");
      
    if (clipObject) {
      clipObject.clone((cloned: fabric.Rect) => {
        canvas.clipPath = cloned;
        canvas.requestRenderAll();
      });
    } else {
      // If there is no clip object, ensure the clipPath is removed
      canvas.clipPath = undefined;
      canvas.requestRenderAll();
    }
  }, [canvas, container]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom();
      });
      resizeObserver.observe(container);
    }
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [canvas, container, autoZoom]);

  return { autoZoom };
};
