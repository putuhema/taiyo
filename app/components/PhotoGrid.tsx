"use client";

import type { Photo } from "../types";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  thumbUrls: Map<string, string>;
  onSelect: (id: string) => void;
}

export function PhotoGrid({ photos, thumbUrls, onSelect }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {photos.map((photo, i) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          url={thumbUrls.get(photo.id)!}
          index={i}
          onClick={() => onSelect(photo.id)}
        />
      ))}
    </div>
  );
}
