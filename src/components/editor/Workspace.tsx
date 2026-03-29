'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ImageFile, ProcessingSettings } from '@/types';
import styles from './Workspace.module.css';
import { processImage, downloadImage } from '@/lib/imageProcessor';
import JSZip from 'jszip';
import { formatBytes } from '@/utils/image';
import { Download, RotateCcw, ChevronLeft, ChevronRight, Settings, Trash2 } from 'lucide-react';
import ControlPanel from '@/components/editor/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WorkspaceProps {
  images: ImageFile[];
  onBack: () => void;
  onRemoveImage: (id: string) => void;
}

const DEFAULT_SETTINGS: ProcessingSettings = {
  resize: { enabled: false, maintainAspectRatio: true },
  compress: { enabled: true, quality: 0.8, maxSizeMB: 1 },
  convert: { enabled: false, format: 'image/jpeg' },
  watermark: { enabled: false, type: 'text', opacity: 0.5, position: 'bottom-right', size: 10, x: 0.9, y: 0.9 },
  transform: { rotate: 0, flipHorizontal: false, flipVertical: false },
  filters: { brightness: 1, contrast: 1, saturation: 1, blur: 0 },
  crop: { enabled: false, aspect: null, circle: false },
};

const Workspace: React.FC<WorkspaceProps> = ({ images, onBack, onRemoveImage }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [settings, setSettings] = useLocalStorage<ProcessingSettings>('pixly-settings', DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);

  const [processedImage, setProcessedImage] = useState<{ blob: Blob; url: string } | null>(null);

  const activeImage = images[activeIndex];

  const handleProcess = useCallback(async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      const result = await processImage(activeImage, settings);
      setProcessedImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [activeImage, settings]);

  useEffect(() => {
    handleProcess();
  }, [handleProcess]);

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage.blob, `pixly-${activeImage.name}`);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const res = await processImage(img, settings);
        const arrayBuffer = await res.blob.arrayBuffer();
        zip.file(img.name, arrayBuffer);
      } catch (e) {
        console.warn('Failed to process', img.name, e);
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    downloadImage(content, `pixly-batch-${Date.now()}.zip`);
  };

  const handleShare = async () => {
    if (!processedImage) return;
    const file = new File([processedImage.blob], activeImage.name, { type: processedImage.blob.type });
    const canShareFn = (navigator as any).canShare;
    const shareFn = (navigator as any).share;
    if (typeof shareFn === 'function' && typeof canShareFn === 'function' && canShareFn({ files: [file] })) {
      try {
        await shareFn({ files: [file], title: activeImage.name });
      } catch (e) {
        console.warn('Share failed', e);
      }
    } else {
      // Fallback: open WhatsApp share link for mobile
      const url = processedImage.url;
      const wa = `https://wa.me/?text=${encodeURIComponent('Check this image: ' + url)}`;
      window.open(wa, '_blank');
    }
  };

  if (!activeImage) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={20} />
          <span>Upload More</span>
        </button>
        <div className={styles.imageInfo}>
          <span className={styles.filename}>{activeImage.name}</span>
          <span className={styles.fileSize}>{formatBytes(activeImage.size)}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className={styles.backBtn} onClick={handleDownloadAll}>
            <Download size={16} />
            <span>Download All</span>
          </button>
          <button className={styles.downloadBtn} onClick={handleDownload} disabled={!processedImage}>
            <Download size={20} />
            <span>Download</span>
          </button>
          <button className={styles.backBtn} onClick={handleShare}>
            <span>Share</span>
          </button>
        </div>
      </header>

      <div className={styles.main}>
        <div className={styles.previewArea}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeImage.id}
              className={styles.previewWrapper}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <img 
                src={processedImage?.url || activeImage.preview} 
                alt="Preview" 
                className={styles.previewImage}
                style={{
                  filter: `brightness(${settings.filters?.brightness ?? 1}) contrast(${settings.filters?.contrast ?? 1}) saturate(${settings.filters?.saturation ?? 1}) blur(${settings.filters?.blur ?? 0}px)`,
                }}
              />

              {/* Watermark preview overlay (client-side only) */}
              {settings.watermark.enabled && (
                <div
                  className={styles.watermarkOverlay}
                  style={{
                    pointerEvents: 'none',
                  }}
                >
                  {settings.watermark.type === 'text' && settings.watermark.text && (
                    <div
                      className={styles.watermarkText}
                      style={{
                        opacity: settings.watermark.opacity,
                        fontSize: `${settings.watermark.size}px`,
                        transform: 'translate(-50%,-50%)',
                        left: `${(settings.watermark.x ?? 0.9) * 100}%`,
                        top: `${(settings.watermark.y ?? 0.9) * 100}%`,
                        position: 'absolute',
                      }}
                    >
                      {settings.watermark.text}
                    </div>
                  )}
                  {settings.watermark.type === 'image' && settings.watermark.image && (
                    <img
                      src={settings.watermark.image}
                      className={styles.watermarkImage}
                      style={{
                        opacity: settings.watermark.opacity,
                        width: `${settings.watermark.size}%`,
                        position: 'absolute',
                        left: `${(settings.watermark.x ?? 0.9) * 100}%`,
                        top: `${(settings.watermark.y ?? 0.9) * 100}%`,
                        transform: 'translate(-50%,-50%)',
                      }}
                    />
                  )}
                </div>
              )}
              {isProcessing && (
                <div className={styles.processingOverlay}>
                  <div className={styles.spinner}></div>
                  <span>Processing...</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className={styles.imageSwitcher}>
             <button 
              disabled={activeIndex === 0} 
              onClick={() => setActiveIndex(activeIndex - 1)}
             >
                <ChevronLeft size={24} />
             </button>
             <span>{activeIndex + 1} / {images.length}</span>
             <button 
              disabled={activeIndex === images.length - 1} 
              onClick={() => setActiveIndex(activeIndex + 1)}
             >
                <ChevronRight size={24} />
             </button>
          </div>
        </div>

        <aside className={`${styles.sidebar} glass`}>
          <ControlPanel 
            settings={settings} 
            onChange={setSettings} 
            onReset={() => setSettings(DEFAULT_SETTINGS)}
          />
        </aside>
      </div>
    </div>
  );
};

export default Workspace;
