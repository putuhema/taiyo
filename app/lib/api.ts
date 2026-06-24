import type { Photo } from "../types";

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data.error === "string" ? data.error : "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  const res = await fetch("/api/photos", { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function addPhoto(
  file: File,
  caption?: string,
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  if (caption?.trim()) formData.append("caption", caption.trim());

  const res = await fetch("/api/photos", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updatePhotoCaption(
  id: string,
  caption: string,
): Promise<Photo> {
  const res = await fetch(`/api/photos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deletePhoto(id: string): Promise<void> {
  const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
}
