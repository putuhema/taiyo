"use client";

import type { Photo } from "../types";
import { getGridSize, gridSizeClasses } from "../lib/grid-layout";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  thumbUrls: Map<string, string>;
  onSelect: (id: string) => void;
}

export function PhotoGrid({ photos, thumbUrls, onSelect }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {photos.map((photo, i) => {
        const size = getGridSize(photo, i);
        return (
          <div key={photo.id} className={gridSizeClasses[size]}>
            <PhotoCard
              photo={photo}
              url={thumbUrls.get(photo.id)!}
              index={i}
              size={size}
              onClick={() => onSelect(photo.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
