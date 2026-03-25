'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import UploadZone from '@/components/upload/UploadZone';
import Workspace from '@/components/editor/Workspace';
import { ImageFile } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const handleImagesSelected = (newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    setIsEditorVisible(true);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!isEditorVisible ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={styles.hero}
          >
            <div className={styles.heroText}>
              <h1 className={styles.title}>
                Transform your images <br />
                <span className={styles.gradient}>instantly.</span>
              </h1>
              <p className={styles.subtitle}>
                The professional-grade image resizer, converter, and watermarker 
                that runs entirely in your browser.
              </p>
            </div>
            
            <UploadZone onImagesSelected={handleImagesSelected} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className={styles.workspace}
          >
            <Workspace 
              images={images} 
              onBack={() => setIsEditorVisible(false)}
              onRemoveImage={(id: string) => setImages(images.filter(img => img.id !== id))}
            />
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
}

