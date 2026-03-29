export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  resultPreview?: string;
}

export interface ProcessingSettings {
  resize: {
    enabled: boolean;
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
    preset?: 'original' | 'social-ig' | 'social-fb' | 'hd' | '4k';
  };
  compress: {
    enabled: boolean;
    quality: number; // 0 to 1
    maxSizeMB: number;
  };
  convert: {
    enabled: boolean;
    format: ImageFormat;
  };
  watermark: {
    enabled: boolean;
    type: 'text' | 'image';
    text?: string;
    image?: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: number; // percentage
    // Optional absolute position for draggable watermark (0-1 normalized)
    x?: number;
    y?: number;
  };
  filters?: {
    brightness?: number; // 0 to 2, 1 = normal
    contrast?: number; // 0 to 2
    saturation?: number; // 0 to 2
    blur?: number; // px
  };
  crop?: {
    enabled: boolean;
    aspect?: number | null; // null = free, or ratio like 1, 16/9
    circle?: boolean;
  };
  transform: {
    rotate: number; // 0, 90, 180, 270
    flipHorizontal: boolean;
    flipVertical: boolean;
  };
}
