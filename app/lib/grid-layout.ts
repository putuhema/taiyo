import type { Photo } from "../types";

export type GridSize = "featured" | "wide" | "tall" | "standard";

export function getGridSize(photo: Photo, index: number): GridSize {
  if (index === 0) return "featured";

  const w = photo.width ?? 3;
  const h = photo.height ?? 4;
  const ratio = w / h;

  // Editorial rhythm — periodic hero tiles
  if (index % 8 === 0) return "featured";
  if (index % 5 === 2 && ratio <= 1.1) return "tall";

  if (ratio >= 1.45) return "wide";
  if (ratio <= 0.72) return "tall";

  return "standard";
}

export const gridSizeClasses: Record<GridSize, string> = {
  featured:
    "col-span-1 row-span-2 min-h-[340px] sm:col-span-2 sm:row-span-2 sm:min-h-0",
  wide: "col-span-1 row-span-1 sm:col-span-2 sm:row-span-1",
  tall: "col-span-1 row-span-2 min-h-[300px] sm:min-h-0",
  standard: "col-span-1 row-span-1",
};
