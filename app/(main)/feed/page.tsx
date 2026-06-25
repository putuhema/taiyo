"use client";

import { PhotoFeed } from "../../components/PhotoFeed";
import { usePhotos } from "../../components/PhotosProvider";

export default function FeedPage() {
  const { photos, hasPhotos, fullUrls, openPhoto } = usePhotos();

  if (!hasPhotos) return null;

  return (
    <PhotoFeed
      photos={photos}
      getUrl={(id) => fullUrls.get(id) ?? null}
      onSelect={openPhoto}
    />
  );
}
