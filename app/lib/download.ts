import type { Photo } from "../types";

export function buildPhotoFilename(photo: Pick<Photo, "id" | "caption" | "createdAt" | "mimeType">): string {
  const ext = photo.mimeType === "image/png" ? "png" : "jpg";
  const date = new Date(photo.createdAt).toISOString().slice(0, 10);

  if (photo.caption?.trim()) {
    const slug = photo.caption
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
    if (slug) return `${slug}-${date}.${ext}`;
  }

  return `taiyo-${date}-${photo.id.slice(0, 8)}.${ext}`;
}
