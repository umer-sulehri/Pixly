'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ImageFile, ProcessingSettings } from '@/types';
import styles from './Workspace.module.css';
import { processImage, downloadImage } from '@/lib/imageProcessor';
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
  watermark: { enabled: false, type: 'text', opacity: 0.5, position: 'bottom-right', size: 10 },
  transform: { rotate: 0, flipHorizontal: false, flipVertical: false },
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
        <button className={styles.downloadBtn} onClick={handleDownload} disabled={!processedImage}>
          <Download size={20} />
          <span>Download</span>
        </button>
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
              />
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
