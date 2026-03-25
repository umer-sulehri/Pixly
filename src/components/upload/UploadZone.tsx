'use client';

import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './UploadZone.module.css';
import { fileToImageFile } from '@/utils/image';
import { ImageFile } from '@/types';

interface UploadZoneProps {
  onImagesSelected: (images: ImageFile[]) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImagesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        try {
          const imgFile = await fileToImageFile(files[i]);
          imageFiles.push(imgFile);
        } catch (err) {
          console.error(err);
        }
      }
    }
    
    if (imageFiles.length > 0) {
      onImagesSelected(imageFiles);
    }
  }, [onImagesSelected]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={styles.wrapper}>
      <motion.div 
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} glass-card`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className={styles.fileInput} 
          onChange={onFileInputChange}
          id="file-upload"
        />
        <label htmlFor="file-upload" className={styles.label}>
          <div className={`${styles.iconWrapper} glass`}>
            <Upload size={40} className={styles.icon} />
          </div>
          <h2 className={styles.title}>Upload your images</h2>
          <p className={styles.subtitle}>
            Drag and drop images here, or click to browse
          </p>
          <div className={styles.supportedFormats}>
            <span>PNG</span>
            <span>JPG</span>
            <span>WebP</span>
          </div>
        </label>
      </motion.div>
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3>Fast Processing</h3>
          <p>Everything happens in your browser</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3>Private & Secure</h3>
          <p>Your images never leave your device</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>✨</div>
          <h3>High Quality</h3>
          <p>Professional compression algorithms</p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
