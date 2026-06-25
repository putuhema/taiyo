"use client";

import { PhotoGrid } from "../../components/PhotoGrid";
import { usePhotos } from "../../components/PhotosProvider";

export default function GalleryPage() {
  const { photos, hasPhotos, thumbUrls, openPhoto } = usePhotos();

  if (!hasPhotos) return null;

  return (
    <div className="mx-auto max-w-[935px] px-1 pb-32 sm:px-4 sm:pb-24">
      <PhotoGrid photos={photos} thumbUrls={thumbUrls} onSelect={openPhoto} />
    </div>
  );
}
