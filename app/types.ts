export interface Photo {
  id: string;
  caption?: string;
  journal?: string;
  createdAt: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
  thumbUrl: string;
}

export interface PhotoMeta {
  id: string;
  caption?: string;
  journal?: string;
  createdAt: number;
}
