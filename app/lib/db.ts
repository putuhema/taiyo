import { generateThumbFromData, processImage } from "./thumbnails";
import { resolveMimeType } from "./images";
import type { Photo, PhotoMeta } from "../types";

const DB_NAME = "sunset-gallery";
const DB_VERSION = 3;
const STORE = "photos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

interface LegacyPhoto {
  id: string;
  caption?: string;
  createdAt: number;
  blob?: Blob;
  data?: ArrayBuffer;
  thumbData?: ArrayBuffer;
  mimeType?: string;
  width?: number;
  height?: number;
}

async function normalizePhoto(raw: LegacyPhoto): Promise<Photo> {
  let data: ArrayBuffer;
  let mimeType: string;

  if (raw.data instanceof ArrayBuffer) {
    data = raw.data;
    mimeType = raw.mimeType || "image/jpeg";
  } else if (raw.blob instanceof Blob) {
    data = await raw.blob.arrayBuffer();
    mimeType = resolveMimeType(raw.blob);
  } else {
    throw new Error("Invalid photo record in storage");
  }

  let thumbData = raw.thumbData;
  if (!(thumbData instanceof ArrayBuffer) || thumbData.byteLength === 0) {
    thumbData = await generateThumbFromData(data, mimeType);
  }

  const photo: Photo = {
    id: raw.id,
    caption: raw.caption,
    createdAt: raw.createdAt,
    data,
    thumbData,
    mimeType,
    width: raw.width,
    height: raw.height,
  };

  if (!raw.thumbData) {
    await persistPhoto(photo);
  }

  return photo;
}

async function persistPhoto(photo: Photo): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const request = tx.objectStore(STORE).put(photo);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await openDB();
  const raw = await new Promise<LegacyPhoto[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as LegacyPhoto[]);
  });

  const photos = await Promise.all(raw.map(normalizePhoto));
  return photos.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addPhoto(
  file: File | Blob,
  caption?: string,
  fileName?: string,
): Promise<Photo> {
  let processed;
  try {
    processed = await processImage(file, fileName);
  } catch {
    const data = await file.arrayBuffer();
    const mimeType = resolveMimeType(file, fileName);
    const thumbData = await generateThumbFromData(data, mimeType);
    processed = { data, thumbData, mimeType, width: undefined, height: undefined };
  }

  const photo: Photo = {
    id: crypto.randomUUID(),
    caption: caption?.trim() || undefined,
    createdAt: Date.now(),
    data: processed.data,
    thumbData: processed.thumbData,
    mimeType: processed.mimeType,
    width: processed.width,
    height: processed.height,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const request = store.add(photo);

    request.onerror = () => reject(request.error ?? new Error("Failed to save photo"));
    request.onsuccess = () => resolve(photo);
  });
}

export async function updatePhotoCaption(
  id: string,
  caption: string,
): Promise<void> {
  const db = await openDB();
  const raw = await new Promise<LegacyPhoto | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as LegacyPhoto | undefined);
  });

  if (!raw) return;

  const photo = await normalizePhoto(raw);
  photo.caption = caption.trim() || undefined;
  await persistPhoto(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const request = tx.objectStore(STORE).delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function photoToMeta(photo: Photo): PhotoMeta {
  return {
    id: photo.id,
    caption: photo.caption,
    createdAt: photo.createdAt,
  };
}
