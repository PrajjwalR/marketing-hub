/**
 * Background removal utility using @imgly/background-removal.
 * Runs entirely on-device using ONNX/WASM — no API needed.
 *
 * We explicitly set publicPath to the staticimgly CDN so the library can
 * always find its model + WASM files regardless of how Next.js bundles it.
 * WASM files are also mirrored in /public/onnxruntime-web/ as a fallback.
 */

type ProgressCallback = (key: string, current: number, total: number) => void;

const IMGLY_VERSION = "1.7.0";
const CDN_BASE = `https://staticimgly.com/@imgly/background-removal-data/${IMGLY_VERSION}/dist/`;

export async function removeBgFromBlob(
  blob: Blob,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");

  const result: Blob = await removeBackground(blob, {
    model: "medium",
    // Explicit CDN publicPath — the library fetches models + WASM from here.
    // This avoids any path resolution issues caused by Turbopack's bundling.
    publicPath: CDN_BASE,
    progress: onProgress,
  });

  return result;
}
