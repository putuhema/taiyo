import { resolveMimeType } from "./images";

const THUMB_MAX = 400;
const FULL_MAX = 2400;

export interface ProcessedImage {
  data: ArrayBuffer;
  thumbData: ArrayBuffer;
  mimeType: string;
  width: number;
  height: number;
}

function loadImageElement(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function resizeToCanvas(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  maxEdge: number,
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(srcWidth, srcHeight));
  const width = Math.round(srcWidth * scale);
  const height = Math.round(srcHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(source, 0, 0, width, height);
  return { canvas, width, height };
}

function canvasToArrayBuffer(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image"));
          return;
        }
        resolve(await blob.arrayBuffer());
      },
      mimeType,
      quality,
    );
  });
}

export async function processImage(
  file: File | Blob,
  fileName?: string,
): Promise<ProcessedImage> {
  const mimeType = resolveMimeType(file, fileName);
  const img = await loadImageElement(file);
  const { width: srcWidth, height: srcHeight } = img;

  const full = resizeToCanvas(img, srcWidth, srcHeight, FULL_MAX);
  const outputMime = mimeType === "image/png" ? "image/png" : "image/jpeg";
  const data = await canvasToArrayBuffer(
    full.canvas,
    outputMime,
    outputMime === "image/jpeg" ? 0.92 : undefined,
  );

  const thumb = resizeToCanvas(full.canvas, full.width, full.height, THUMB_MAX);
  const thumbData = await canvasToArrayBuffer(thumb.canvas, "image/jpeg", 0.8);

  return {
    data,
    thumbData,
    mimeType: outputMime,
    width: srcWidth,
    height: srcHeight,
  };
}

export async function generateThumbFromData(
  data: ArrayBuffer,
  mimeType: string,
): Promise<ArrayBuffer> {
  const blob = new Blob([data], { type: mimeType });
  const img = await loadImageElement(blob);
  const thumb = resizeToCanvas(img, img.naturalWidth, img.naturalHeight, THUMB_MAX);
  return canvasToArrayBuffer(thumb.canvas, "image/jpeg", 0.8);
}
