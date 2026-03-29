import imageCompression from 'browser-image-compression';
import { ImageFile, ProcessingSettings } from '@/types';

export async function processImage(
  imageFile: ImageFile,
  settings: ProcessingSettings
): Promise<{ blob: Blob; url: string }> {
  // 1. Create a canvas and draw the image
  const img = await loadImage(imageFile.preview);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Calculate new dimensions if resizing is enabled
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (settings.resize.enabled) {
    if (settings.resize.width && settings.resize.height) {
      targetWidth = settings.resize.width;
      targetHeight = settings.resize.height;
    } else if (settings.resize.width) {
      if (settings.resize.maintainAspectRatio) {
        targetHeight = (img.height / img.width) * settings.resize.width;
      }
      targetWidth = settings.resize.width;
    } else if (settings.resize.height) {
      if (settings.resize.maintainAspectRatio) {
        targetWidth = (img.width / img.height) * settings.resize.height;
      }
      targetHeight = settings.resize.height;
    }
  }

  // Handle Rotation (Rotation affects canvas dimensions)
  const is90or270 = settings.transform.rotate === 90 || settings.transform.rotate === 270;
  canvas.width = is90or270 ? targetHeight : targetWidth;
  canvas.height = is90or270 ? targetWidth : targetHeight;

  // Apply Transformations
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((settings.transform.rotate * Math.PI) / 180);
  
  const scaleX = settings.transform.flipHorizontal ? -1 : 1;
  const scaleY = settings.transform.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Apply filters if any
  if (settings.filters) {
    const { brightness = 1, contrast = 1, saturation = 1, blur = 0 } = settings.filters;
    // CSS-like filter string supported by canvas
    ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
  }

  // Draw the image onto the canvas
  // Note: drawImage coordinates are relative to the current transformation matrix
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

  // Clear filter for subsequent drawing operations
  ctx.filter = 'none';

  // Reset transformation for watermarking
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // 2. Apply Watermark
  if (settings.watermark.enabled) {
    await applyWatermark(ctx, canvas.width, canvas.height, settings.watermark);
  }

  // 3. Convert Format and Get Blob
  const format = settings.convert.enabled ? settings.convert.format : (imageFile.type as any);
  let blob = await canvasToBlob(canvas, format, settings.compress.quality);

  // 4. Handle Compression if needed (beyond just quality setting)
  if (settings.compress.enabled) {
    const compressionOptions = {
      maxSizeMB: settings.compress.maxSizeMB,
      maxWidthOrHeight: Math.max(canvas.width, canvas.height),
      useWebWorker: true,
      initialQuality: settings.compress.quality,
    };
    const compressedFile = await imageCompression(new File([blob], imageFile.name, { type: format }), compressionOptions);
    blob = compressedFile;
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob conversion failed'));
    }, format, quality);
  });
}

function applyWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings['watermark']
) {
  return new Promise<void>(async (resolve) => {
    if (settings.type === 'text' && settings.text) {
    const fontSize = (width * settings.size) / 100;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${settings.opacity})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let x = width / 2;
    let y = height / 2;

    const margin = fontSize;
    switch (settings.position) {
      case 'top-left': x = margin; y = margin; ctx.textAlign = 'left'; break;
      case 'top-right': x = width - margin; y = margin; ctx.textAlign = 'right'; break;
      case 'bottom-left': x = margin; y = height - margin; ctx.textAlign = 'left'; break;
      case 'bottom-right': x = width - margin; y = height - margin; ctx.textAlign = 'right'; break;
    }

      // If absolute x/y provided (0..1), use them
      if (typeof settings.x === 'number' && typeof settings.y === 'number') {
        x = settings.x * width;
        y = settings.y * height;
      }

      ctx.fillText(settings.text, x, y);
      resolve();
  }
    else if (settings.type === 'image' && settings.image) {
      try {
        const wm = await loadImage(settings.image);
        // scale watermark to a fraction of canvas width based on settings.size
        const wmWidth = (width * settings.size) / 100;
        const scale = wmWidth / wm.width;
        const wmHeight = wm.height * scale;

        let x = width - wmWidth - 16;
        let y = height - wmHeight - 16;
        switch (settings.position) {
          case 'top-left': x = 16; y = 16; break;
          case 'top-right': x = width - wmWidth - 16; y = 16; break;
          case 'bottom-left': x = 16; y = height - wmHeight - 16; break;
          case 'bottom-right': x = width - wmWidth - 16; y = height - wmHeight - 16; break;
          case 'center': x = (width - wmWidth) / 2; y = (height - wmHeight) / 2; break;
        }
        if (typeof settings.x === 'number' && typeof settings.y === 'number') {
          x = settings.x * width - wmWidth / 2;
          y = settings.y * height - wmHeight / 2;
        }

        ctx.globalAlpha = settings.opacity;
        ctx.drawImage(wm, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1;
      } catch (e) {
        console.warn('Failed to load watermark image', e);
      }
      resolve();
    } else {
      resolve();
    }
  });
}

export async function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
