'use client';

import React from 'react';
import { ProcessingSettings, ImageFormat } from '@/types';
import styles from './ControlPanel.module.css';
import { 
  Maximize, 
  Minimize2, 
  Type, 
  RefreshCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Settings2,
  Image as ImageIcon
} from 'lucide-react';

interface ControlPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onChange, onReset }) => {
  const updateSetting = (section: keyof ProcessingSettings, key: string, value: any) => {
    onChange({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const toggleSection = (section: keyof Omit<ProcessingSettings, 'transform'>) => {
    onChange({
      ...settings,
      [section]: {
        ...(settings[section] as any),
        enabled: !(settings[section] as any).enabled,
      },
    });
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Settings2 size={18} />
          <span>Image Settings</span>
        </div>
        <button className={styles.resetBtn} onClick={onReset}>
          <RefreshCcw size={14} />
          Reset
        </button>
      </div>

      <div className={styles.sections}>
        {/* Resize Section */}
        <div className={`${styles.section} ${settings.resize.enabled ? styles.active : ''}`}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('resize')}>
            <div className={styles.sectionTitle}>
              <Maximize size={18} />
              <span>Resize</span>
            </div>
            <input type="checkbox" checked={settings.resize.enabled} readOnly />
          </div>
          {settings.resize.enabled && (
            <div className={styles.sectionContent}>
              <div className={styles.inputGroup}>
                <label>Width (px)</label>
                <input 
                  type="number" 
                  value={settings.resize.width || ''} 
                  onChange={(e) => updateSetting('resize', 'width', parseInt(e.target.value))}
                  placeholder="Auto"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Height (px)</label>
                <input 
                  type="number" 
                  value={settings.resize.height || ''} 
                  onChange={(e) => updateSetting('resize', 'height', parseInt(e.target.value))}
                  placeholder="Auto"
                />
              </div>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={settings.resize.maintainAspectRatio} 
                  onChange={(e) => updateSetting('resize', 'maintainAspectRatio', e.target.checked)}
                />
                Maintain Aspect Ratio
              </label>
            </div>
          )}
        </div>

        {/* Compress Section */}
        <div className={`${styles.section} ${settings.compress.enabled ? styles.active : ''}`}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('compress')}>
            <div className={styles.sectionTitle}>
              <Minimize2 size={18} />
              <span>Compress</span>
            </div>
            <input type="checkbox" checked={settings.compress.enabled} readOnly />
          </div>
          {settings.compress.enabled && (
            <div className={styles.sectionContent}>
              <div className={styles.inputGroup}>
                <label>Quality ({Math.round(settings.compress.quality * 100)}%)</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  value={settings.compress.quality} 
                  onChange={(e) => updateSetting('compress', 'quality', parseFloat(e.target.value))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Max Size (MB)</label>
                <input 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  value={settings.compress.maxSizeMB} 
                  onChange={(e) => updateSetting('compress', 'maxSizeMB', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Convert Section */}
        <div className={`${styles.section} ${settings.convert.enabled ? styles.active : ''}`}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('convert')}>
            <div className={styles.sectionTitle}>
              <ImageIcon size={18} />
              <span>Convert</span>
            </div>
            <input type="checkbox" checked={settings.convert.enabled} readOnly />
          </div>
          {settings.convert.enabled && (
            <div className={styles.sectionContent}>
              <div className={styles.inputGroup}>
                <label>Target Format</label>
                <select 
                  value={settings.convert.format} 
                  onChange={(e) => updateSetting('convert', 'format', e.target.value as ImageFormat)}
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Watermark Section */}
        <div className={`${styles.section} ${settings.watermark.enabled ? styles.active : ''}`}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('watermark')}>
            <div className={styles.sectionTitle}>
              <Type size={18} />
              <span>Watermark</span>
            </div>
            <input type="checkbox" checked={settings.watermark.enabled} readOnly />
          </div>
          {settings.watermark.enabled && (
            <div className={styles.sectionContent}>
              <div className={styles.inputGroup}>
                <label>Text</label>
                <input 
                  type="text" 
                  value={settings.watermark.text || ''} 
                  onChange={(e) => updateSetting('watermark', 'text', e.target.value)}
                  placeholder="Enter watermark text"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Opacity ({Math.round(settings.watermark.opacity * 100)}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={settings.watermark.opacity} 
                  onChange={(e) => updateSetting('watermark', 'opacity', parseFloat(e.target.value))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Position</label>
                <select 
                  value={settings.watermark.position} 
                  onChange={(e) => updateSetting('watermark', 'position', e.target.value)}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Transform Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ padding: '0.75rem 0' }}>
            <RefreshCcw size={18} />
            <span>Transform</span>
          </div>
          <div className={styles.transformControls}>
            <button 
              className={`${styles.toolBtn} ${settings.transform.rotate !== 0 ? styles.activeTool : ''}`}
              onClick={() => updateSetting('transform', 'rotate', (settings.transform.rotate + 90) % 360)}
              title="Rotate 90°"
            >
              <RefreshCcw size={18} />
            </button>
            <button 
              className={`${styles.toolBtn} ${settings.transform.flipHorizontal ? styles.activeTool : ''}`}
              onClick={() => updateSetting('transform', 'flipHorizontal', !settings.transform.flipHorizontal)}
              title="Flip Horizontal"
            >
              <FlipHorizontal size={18} />
            </button>
            <button 
              className={`${styles.toolBtn} ${settings.transform.flipVertical ? styles.activeTool : ''}`}
              onClick={() => updateSetting('transform', 'flipVertical', !settings.transform.flipVertical)}
              title="Flip Vertical"
            >
              <FlipVertical size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
