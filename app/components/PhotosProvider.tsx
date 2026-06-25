"use client";

import { useMutation } from "convex/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import {
  addPhoto,
  deletePhoto,
  getAllPhotos,
  updatePhotoCaption,
  updatePhotoJournal,
} from "../lib/api";
import type { Photo } from "../types";
import { PhotoPost } from "./PhotoPost";
import { Toast } from "./Toast";
import { UploadZone } from "./UploadZone";

interface PhotosContextValue {
  photos: Photo[];
  loaded: boolean;
  hasPhotos: boolean;
  thumbUrls: Map<string, string>;
  fullUrls: Map<string, string>;
  selectedId: string | null;
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  openPhoto: (id: string) => void;
  closePhoto: () => void;
  handleUpload: (file: File, caption: string, journal?: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleUpdateCaption: (id: string, caption: string) => Promise<void>;
  handleUpdateJournal: (id: string, journal: string) => Promise<void>;
  handleNavigate: (id: string) => void;
}

const PhotosContext = createContext<PhotosContextValue | null>(null);

export function usePhotos() {
  const ctx = useContext(PhotosContext);
  if (!ctx) throw new Error("usePhotos must be used within PhotosProvider");
  return ctx;
}

interface PhotosProviderContentProps {
  children: React.ReactNode;
  onClearEngagement?: (photoId: string) => Promise<void>;
}

function PhotosProviderContent({ children, onClearEngagement }: PhotosProviderContentProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const thumbUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const photo of photos) {
      map.set(photo.id, photo.thumbUrl);
    }
    return map;
  }, [photos]);

  const fullUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const photo of photos) {
      map.set(photo.id, photo.url);
    }
    return map;
  }, [photos]);

  useEffect(() => {
    getAllPhotos()
      .then((data) => {
        setPhotos(data);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  const handleUpload = useCallback(async (file: File, caption: string, journal?: string) => {
    const photo = await addPhoto(file, caption, journal);
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await deletePhoto(id);
      try {
        await onClearEngagement?.(id);
      } catch {
        // ignore
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    },
    [onClearEngagement],
  );

  const handleUpdateCaption = useCallback(async (id: string, caption: string) => {
    const updated = await updatePhotoCaption(id, caption);
    setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const handleUpdateJournal = useCallback(async (id: string, journal: string) => {
    const updated = await updatePhotoJournal(id, journal);
    setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const value: PhotosContextValue = {
    photos,
    loaded,
    hasPhotos: photos.length > 0,
    thumbUrls,
    fullUrls,
    selectedId,
    uploadOpen,
    setUploadOpen,
    openPhoto: setSelectedId,
    closePhoto: () => setSelectedId(null),
    handleUpload,
    handleDelete,
    handleUpdateCaption,
    handleUpdateJournal,
    handleNavigate: setSelectedId,
  };

  return (
    <PhotosContext.Provider value={value}>
      {children}

      <UploadZone
        hideTrigger
        onUpload={handleUpload}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={() => setToast("Photo added to gallery")}
      />

      <PhotoPost
        photos={photos}
        selectedId={selectedId}
        getUrl={(id) => fullUrls.get(id) ?? null}
        onClose={() => setSelectedId(null)}
        onNavigate={setSelectedId}
        onDelete={handleDelete}
        onUpdateCaption={handleUpdateCaption}
        onUpdateJournal={handleUpdateJournal}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </PhotosContext.Provider>
  );
}

function PhotosProviderWithConvex({ children }: { children: React.ReactNode }) {
  const clearEngagement = useMutation(api.engagement.clearForPhoto);

  const onClearEngagement = useCallback(
    async (photoId: string) => {
      await clearEngagement({ photoId });
    },
    [clearEngagement],
  );

  return (
    <PhotosProviderContent onClearEngagement={onClearEngagement}>
      {children}
    </PhotosProviderContent>
  );
}

export function PhotosProvider({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <PhotosProviderWithConvex>{children}</PhotosProviderWithConvex>;
  }
  return <PhotosProviderContent>{children}</PhotosProviderContent>;
}
