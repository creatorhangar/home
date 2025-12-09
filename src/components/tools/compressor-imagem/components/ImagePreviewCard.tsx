import React, { useState, useEffect, useRef } from 'react';
import type { ImageFile, Settings, WatermarkSettings } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, SpinnerIcon, DownloadIcon, TrashIcon, PhotoIcon } from './icons';
import { Checkbox } from './Checkbox';
import { useI18n } from '../i18n';

interface ImagePreviewCardProps {
  imageFile: ImageFile;
  isSelected: boolean;
  settings: Settings;
  onSelectionChange: () => void;
  onDelete: () => void;
  onDownload: (format: 'individual' | 'pdf') => void;
  isProcessing: boolean;
}

const FileInfo: React.FC<{
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ bytes = 0, format = '?', width = 0, height = 0, className = '' }) => {
  const { t } = useI18n();
  const byteUnits: string[] = t('image_card.byte_units');

  const formatBytes = (b: number, decimals = 1) => {
    if (b <= 0) return '0 ' + (byteUnits[0] || 'Bytes');
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(dm)) + ' ' + byteUnits[i];
  };

  const dimensions = t('image_card.details_format', { format, width, height });

  return (
    <div className={`text-xs text-dark-gray dark:text-light-gray ${className}`}>
      <span>{dimensions}</span>
      <span className="mx-1">•</span>
      <span className="font-medium">{formatBytes(bytes)}</span>
    </div>
  );
};

const WatermarkPreview: React.FC<{ watermarkSettings: WatermarkSettings, containerRef: React.RefObject<HTMLDivElement | null> }> = ({ watermarkSettings, containerRef }) => {
  const [mosaicUrl, setMosaicUrl] = useState('');
  const { type, text, size, color, opacity, position, mosaic, angle, offsetX, offsetY, imageUrl } = watermarkSettings;
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerSize({ width: node.offsetWidth, height: node.offsetHeight });
    });

    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (type === 'text' && text && mosaic && containerSize.width > 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fontSize = (size / 100) * containerSize.width * 0.5;
      ctx.font = `bold ${fontSize}px sans-serif`;

      const textMetrics = ctx.measureText(text);
      const patternWidth = textMetrics.width * 1.5;
      const patternHeight = fontSize * 3;

      canvas.width = patternWidth;
      canvas.height = patternHeight;

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.translate(patternWidth / 2, patternHeight / 2);
      ctx.rotate(angle * Math.PI / 180);
      ctx.fillText(text, 0, 0);

      setMosaicUrl(canvas.toDataURL('image/png'));
    }
  }, [type, text, mosaic, size, color, angle, containerSize.width]);

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: opacity,
    pointerEvents: 'none',
    overflow: 'hidden',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  };

  if (mosaic) {
    if (type === 'text') {
      wrapperStyle.backgroundImage = `url(${mosaicUrl})`;
      wrapperStyle.backgroundRepeat = 'repeat';
    }
    return <div style={wrapperStyle}></div>;
  }

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    transform: `translate(${offsetX}%, ${offsetY}%)`,
  };

  const margin = '2%';
  if (position.includes('left')) positionStyles.left = margin;
  if (position.includes('right')) positionStyles.right = margin;
  if (position.includes('top')) positionStyles.top = margin;
  if (position.includes('bottom')) positionStyles.bottom = margin;
  if (position.includes('center')) {
    positionStyles.left = '50%';
    positionStyles.transform += ' translateX(-50%)';
  }
  if (position === 'center' || position.includes('middle')) {
    positionStyles.top = '50%';
    positionStyles.transform += ' translateY(-50%)';
  }

  if (type === 'text') {
    return (
      <div style={wrapperStyle}>
        <span style={{
          ...positionStyles,
          fontSize: `${(size / 100) * (containerSize.width * 0.8)}px`, // Use 80% of container for safer sizing
          color: color,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}>
          {text}
        </span>
      </div>
    );
  }

  if (type === 'image' && imageUrl) {
    return (
      <div style={wrapperStyle}>
        <img
          src={imageUrl}
          alt="Watermark preview"
          style={{
            ...positionStyles,
            width: `${size}%`,
            height: 'auto',
          }}
        />
      </div>
    );
  }

  return null;
};

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({ imageFile, isSelected, settings, onSelectionChange, onDelete, onDownload, isProcessing }) => {
  const { file, previewUrl, status, newSize, processedBlob, errorMessage, newWidth, newHeight, originalWidth, originalHeight, renamedFilename } = imageFile;
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [glowClass, setGlowClass] = useState('');
  const cardContentRef = useRef<HTMLDivElement>(null);

  const { t } = useI18n();

  const displayName = renamedFilename || file.name;

  const isDone = status === 'done' && newSize !== undefined;

  useEffect(() => {
    if (isDone) {
      const isReduction = (file.size - (newSize || 0)) >= 0;
      setGlowClass(isReduction ? 'animate-glow-success' : 'animate-glow-warning');
      const glowTimer = setTimeout(() => setGlowClass(''), 1500);
      return () => clearTimeout(glowTimer);
    } else {
      setGlowClass('');
    }
  }, [status, isDone, file.size, newSize]);

  useEffect(() => {
    if (processedBlob) {
      const objectUrl = URL.createObjectURL(processedBlob);
      setProcessedUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [processedBlob]);

  const savings = isDone ? file.size - newSize : 0;
  const percentage = isDone && file.size > 0 ? Math.round((savings / file.size) * 100) : 0;
  const isReduction = savings >= 0;

  const originalFormat = file.type.split('/')[1]?.toUpperCase();
  const newFormat = processedBlob ? processedBlob.type.split('/')[1]?.toUpperCase() : '';

  const renderContent = () => {
    if (!isDone && status !== 'error' && status !== 'processing') {
      // Single view before processing
      return (
        <div className="w-full h-full relative">
          <img src={previewUrl} alt={displayName} className="w-full h-full object-contain" />
          {settings.watermark.enabled && <WatermarkPreview watermarkSettings={settings.watermark} containerRef={cardContentRef as any} />}
        </div>
      );
    }

    // Split view for processing, done, or error
    return (
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full relative">
          <div className="absolute top-1 left-1 text-xs font-bold bg-black/30 text-white px-1.5 py-0.5 rounded-full z-10">{t('image_card.before')}</div>
          <img src={previewUrl} alt={displayName} className="w-full h-full object-contain" />
          {settings.watermark.enabled && <WatermarkPreview watermarkSettings={settings.watermark} containerRef={cardContentRef} />}
        </div>
        <div className="w-px bg-light-border dark:bg-border-gray" />
        <div className="w-1/2 h-full flex flex-col items-center justify-center bg-light-accent/50 dark:bg-dark-bg/30 text-center p-2 relative">
          {status === 'processing' ? (
            <SpinnerIcon className="w-8 h-8 text-primary-action" />
          ) : processedUrl ? (
            <>
              <div className="absolute top-1 left-1 text-xs font-bold bg-black/30 text-white px-1.5 py-0.5 rounded-full z-10">{t('image_card.after')}</div>
              <img src={processedUrl} alt={displayName} className="w-full h-full object-contain" />
            </>
          ) : (
            <>
              <PhotoIcon className="w-10 h-10 text-dark-gray/60 dark:text-light-gray" />
              <p className="mt-1 text-xs text-dark-gray/80 dark:text-light-gray/60">{t('image_card.no_preview')}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`group bg-light-card dark:bg-dark-card border rounded-xl overflow-hidden flex flex-col text-xs shadow-sm transition-all duration-300 ${isSelected ? 'border-primary-action' : 'border-light-border dark:border-border-gray'} ${glowClass}`}>
      <div ref={cardContentRef as any} className="relative aspect-square w-full bg-light-accent/50 dark:bg-dark-bg/20">
        {renderContent()}
      </div>

      <div className="absolute top-2 left-2 z-20">
        <Checkbox checked={isSelected} onChange={onSelectionChange} disabled={isProcessing} />
      </div>

      <div className="p-3 text-sm flex-grow flex flex-col justify-between">
        <div className="text-center">
          <p className="font-medium text-dark-text dark:text-white truncate" title={displayName}>{displayName}</p>

          <div className="flex flex-col items-center mt-1.5 gap-1">
            <FileInfo bytes={file.size} format={originalFormat} width={originalWidth} height={originalHeight} />
            {isDone && (
              <div className="flex items-center justify-center gap-2">
                <FileInfo bytes={newSize} format={newFormat} width={newWidth} height={newHeight} className={isReduction ? 'text-success' : 'text-danger'} />
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isReduction ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                  {isReduction ? `-${percentage}%` : `+${Math.abs(percentage)}%`}
                </span>
              </div>
            )}
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-2 text-center" title={errorMessage}>
            <p className="font-semibold text-danger flex items-center justify-center gap-1.5"><ExclamationTriangleIcon className="w-4 h-4" /> {t('image_card.error_label')}</p>
            <p className="text-xs text-dark-gray dark:text-light-gray mt-1 truncate">{errorMessage}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onDownload('individual')} disabled={!isDone || isProcessing} className="flex-1 flex items-center justify-center h-8 bg-light-accent dark:bg-border-gray rounded-md hover:bg-primary-action hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button onClick={onDelete} disabled={isProcessing} title={t('image_card.delete_file')} className="flex-shrink-0 flex items-center justify-center h-8 w-8 bg-light-accent dark:bg-border-gray rounded-md hover:bg-danger hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
