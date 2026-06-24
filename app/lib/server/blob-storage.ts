import { del, head, put } from "@vercel/blob";
import sharp from "sharp";

const MANIFEST_PATH = "taiyo/manifest.json";
const PHOTOS_PREFIX = "taiyo/photos";

export interface StoredPhoto {
  id: string;
  caption?: string;
  createdAt: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
  thumbUrl: string;
}

interface Manifest {
  photos: StoredPhoto[];
}

const putOptions = {
  access: "public" as const,
  addRandomSuffix: false,
  allowOverwrite: true,
};

async function readManifest(): Promise<Manifest> {
  try {
    const meta = await head(MANIFEST_PATH);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return { photos: [] };
    return (await res.json()) as Manifest;
  } catch {
    return { photos: [] };
  }
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await put(MANIFEST_PATH, JSON.stringify(manifest), {
    ...putOptions,
    contentType: "application/json",
  });
}

export async function listPhotos(): Promise<StoredPhoto[]> {
  const { photos } = await readManifest();
  return photos.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addPhoto(
  buffer: Buffer,
  caption?: string,
): Promise<StoredPhoto> {
  const id = crypto.randomUUID();
  const image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const mimeType =
    metadata.format === "png"
      ? "image/png"
      : metadata.format === "webp"
        ? "image/webp"
        : "image/jpeg";

  const usePng = mimeType === "image/png";
  const ext = usePng ? "png" : "jpg";
  const fullContentType = usePng ? "image/png" : "image/jpeg";

  const fullBuffer = usePng
    ? await image
        .clone()
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    : await image
        .clone()
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 92 })
        .toBuffer();

  const thumbBuffer = await image
    .clone()
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fullPath = `${PHOTOS_PREFIX}/${id}/full.${ext}`;
  const thumbPath = `${PHOTOS_PREFIX}/${id}/thumb.jpg`;

  const [fullBlob, thumbBlob] = await Promise.all([
    put(fullPath, fullBuffer, {
      ...putOptions,
      contentType: fullContentType,
    }),
    put(thumbPath, thumbBuffer, {
      ...putOptions,
      contentType: "image/jpeg",
    }),
  ]);

  const photo: StoredPhoto = {
    id,
    caption: caption?.trim() || undefined,
    createdAt: Date.now(),
    mimeType: fullContentType,
    width,
    height,
    url: fullBlob.url,
    thumbUrl: thumbBlob.url,
  };

  const manifest = await readManifest();
  manifest.photos.unshift(photo);
  await writeManifest(manifest);

  return photo;
}

export async function updatePhotoCaption(
  id: string,
  caption: string,
): Promise<StoredPhoto | null> {
  const manifest = await readManifest();
  const index = manifest.photos.findIndex((p) => p.id === id);
  if (index < 0) return null;

  manifest.photos[index] = {
    ...manifest.photos[index],
    caption: caption.trim() || undefined,
  };
  await writeManifest(manifest);
  return manifest.photos[index];
}

export async function deletePhoto(id: string): Promise<boolean> {
  const manifest = await readManifest();
  const photo = manifest.photos.find((p) => p.id === id);
  if (!photo) return false;

  await del([photo.url, photo.thumbUrl]);
  manifest.photos = manifest.photos.filter((p) => p.id !== id);
  await writeManifest(manifest);
  return true;
}
