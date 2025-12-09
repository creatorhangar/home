export type OutputFormat = 'png' | 'jpeg' | 'webp' | 'tiff' | 'avif' | 'pdf';
export type ProcessingStatus = 'idle' | 'processing' | 'done';

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  size: number; // Percentage of image width
  color: string; // hex
  opacity: number; // 0-1
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  imageFile?: File;
  imageUrl?: string;
  mosaic: boolean;
  angle: number;
  offsetX: number;
  offsetY: number;
}

export interface PdfSettings {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  imageFit: 'stretch' | 'contain';
}

export interface Settings {
  outputFormat: OutputFormat;
  quality: number; // 0-100
  resize: boolean;
  resizeMode: 'percentage' | 'pixels';
  resizeWidth: number | null;
  resizeHeight: number | null;
  resizeFit: 'contain' | 'cover' | 'fill' | 'smart-fill';
  rotation: 0 | 90 | 180 | 270;
  watermark: WatermarkSettings;
  pdf: PdfSettings;
}

export interface Preset {
  id: string;
  name: string;
  settings: Settings;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
  newSize?: number;
  errorMessage?: string;
  newWidth?: number;
  newHeight?: number;
  originalWidth?: number;
  originalHeight?: number;
  renamedFilename?: string;
}

export interface NotificationType {
  id: number;
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  details?: string[];
}

export interface AddFilesConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: () => void;
  onAppend: () => void;
}