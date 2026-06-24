export interface Photo {
  id: string;
  caption?: string;
  createdAt: number;
  data: ArrayBuffer;
  thumbData: ArrayBuffer;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface PhotoMeta {
  id: string;
  caption?: string;
  createdAt: number;
}

export function photoToBlob(photo: Photo): Blob {
  return new Blob([photo.data], { type: photo.mimeType });
}

export function photoToThumbBlob(photo: Photo): Blob {
  if (photo.thumbData?.byteLength) {
    return new Blob([photo.thumbData], { type: "image/jpeg" });
  }
  return photoToBlob(photo);
}
