import type { Settings, OutputFormat } from './types';

export const DEFAULT_SETTINGS: Settings = {
  outputFormat: 'jpeg',
  quality: 90,
  resize: false,
  resizeMode: 'pixels',
  resizeWidth: 1920,
  resizeHeight: null,
  resizeFit: 'contain',
  rotation: 0,
  watermark: {
    enabled: false,
    type: 'text',
    text: 'Your Watermark',
    size: 5,
    color: '#ffffff',
    opacity: 0.7,
    position: 'bottom-right',
    mosaic: false,
    angle: -45,
    offsetX: 0,
    offsetY: 0,
  },
  pdf: {
    pageSize: 'A4',
    orientation: 'portrait',
    imageFit: 'contain'
  }
};

export const ACCEPTED_INPUT_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/gif', 'image/bmp', 'image/avif'];
export const ACCEPTED_INPUT_FORMATS_WITH_HEIC = [...ACCEPTED_INPUT_FORMATS, 'image/heic', 'image/heif', '.heic', '.heif'];
export const ACCEPTED_INPUT_FORMATS_STRING = 'JPG, PNG, WebP, SVG, TIFF, GIF, BMP, AVIF, HEIC';

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const ALL_OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'tiff', label: 'TIFF' },
  { value: 'pdf', label: 'PDF' },
];