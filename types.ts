export interface ProcessedMedia {
  originalUrl: string;
  processedUrl: string | null;
  type: 'image' | 'video-frame';
  fileName: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}
