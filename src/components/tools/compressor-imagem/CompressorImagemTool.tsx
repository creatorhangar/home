'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import heic2any from 'heic2any';
import { PDFDocument, PageSizes } from 'pdf-lib';

import type { ImageFile, Settings, ProcessingStatus, NotificationType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_SETTINGS, MAX_FILE_SIZE, ACCEPTED_INPUT_FORMATS } from './constants';
import { imageProcessorWorkerString } from './workers/imageProcessor';
import { useI18n } from './i18n';

// import { Header } from './components/Header'; // Removed
import { FileUpload } from './components/FileUpload';
import { ImageList } from './components/ImageList';
import { SettingsPanel } from './components/SettingsPanel';
import { InfoModal } from './components/InfoModal';
import { Notification } from './components/Notification';
import { AddFilesConfirmationModal } from './components/AddFilesConfirmationModal';
import { RenameModal } from './components/RenameModal';

import { useUsage } from '@/lib/hooks/useUsage';
import { useRouter } from 'next/navigation';

export default function CompressorImagemTool() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useLocalStorage<Settings>('converter-settings', DEFAULT_SETTINGS);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalInBatch, setTotalInBatch] = useState(0);
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'light');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<ImageFile[]>([]);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ImageFile | null>(null);

  const { t } = useI18n();
  const { incrementUsage } = useUsage();
  const router = useRouter();

  const workerRef = useRef<Worker | null>(null);
  const watchdogTimerRef = useRef<number | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  // Theme management (Modified to respect system preference or manual toggle, but syncing with main app might be better)
  useEffect(() => {
    // For now we keep local theme logic but it might conflict with global theme
    // Removing body class manipulation to avoid breaking main app
  }, [theme]);

  // Live Preview File Management
  useEffect(() => {
    if (selectedFileIds.size === 1) {
      const selectedId = selectedFileIds.values().next().value;
      const fileToPreview = files.find(f => f.id === selectedId);
      setPreviewFile(fileToPreview || null);
    } else {
      setPreviewFile(null);
    }
  }, [selectedFileIds, files]);

  // Paste from clipboard handler
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            // Create a more descriptive name for pasted images
            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const fileExtension = file.type.split('/')[1] || 'png';
            const newFile = new File([file], `Pasted-Image-${timestamp}.${fileExtension}`, { type: file.type });
            imageFiles.push(newFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        handleNewFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []); // Empty dependency array means this effect runs once on mount




  const clearWatchdog = () => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  };

  const setWatchdog = () => {
    clearWatchdog();
    watchdogTimerRef.current = window.setTimeout(() => {
      console.error('Watchdog timeout: Conversion process seems to be stuck.');
      setProcessingStatus('done');
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.status === 'processing'
            ? { ...f, status: 'error', errorMessage: t('notifications.process_stalled') }
            : f
        )
      );
    }, 30000);
  };

  const showNotification = useCallback((notificationData: Omit<NotificationType, 'id'>) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification({ ...notificationData, id: Date.now() });
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 6000);
  }, [t]);

  const initializeWorker = useCallback(() => {
    const workerBlob = new Blob([imageProcessorWorkerString], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.postMessage({ type: 'INIT', utifPath: 'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js' });

    worker.onmessage = (e) => {
      const { id, blob, error, newWidth, newHeight } = e.data;

      setWatchdog();

      setFiles(prevFiles =>
        prevFiles.map(f => {
          if (f.id === id) {
            if (error) {
              const errorMessage = error === 'tiff_error' ? t('notifications.tiff_error') : error;
              return { ...f, status: 'error', errorMessage };
            }
            return {
              ...f,
              status: 'done',
              processedBlob: blob,
              newSize: blob.size,
              newWidth,
              newHeight
            };
          }
          return f;
        })
      );

      setProcessedCount(prev => {
        const newCount = prev + 1;
        const filesToProcessCount = totalInBatch;
        if (newCount >= filesToProcessCount) {
          setProcessingStatus('done');
          clearWatchdog();
        }
        return newCount;
      });
    };

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [t, totalInBatch]);

  useEffect(() => {
    const cleanup = initializeWorker();
    return () => {
      cleanup();
      clearWatchdog();
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
      files.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
        if (file.processedBlob) URL.revokeObjectURL(URL.createObjectURL(file.processedBlob));
      });
    };
  }, [initializeWorker]);

  const handleNewFiles = async (incomingFiles: File[]) => {
    const acceptedFiles: ImageFile[] = [];
    const rejectedSizeFiles: File[] = [];
    const rejectedHeicFiles: File[] = [];
    let processedHeic = false;

    for (const file of incomingFiles) {
      if (file.size > MAX_FILE_SIZE) {
        rejectedSizeFiles.push(file);
        continue;
      }

      const isHeic = file.type.startsWith('image/heic') || file.type.startsWith('image/heif') || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

      if (!ACCEPTED_INPUT_FORMATS.includes(file.type) && !isHeic) {
        continue;
      }

      let fileToProcess = file;
      if (isHeic) {
        try {
          // @ts-ignore
          const conversionResult = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.94 });
          const convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
          fileToProcess = new File([convertedBlob], `${originalName}.jpg`, { type: 'image/jpeg' });
          processedHeic = true;
        } catch (e) {
          console.error("HEIC conversion failed:", e);
          rejectedHeicFiles.push(file);
          continue;
        }
      }

      const id = uuidv4();
      const previewUrl = URL.createObjectURL(fileToProcess);
      const img = new Image();
      img.src = previewUrl;

      const imageFile: ImageFile = { id, file: fileToProcess, previewUrl, status: 'pending' };

      const loadPromise = new Promise<ImageFile>((resolve) => {
        img.onload = () => resolve({ ...imageFile, originalWidth: img.width, originalHeight: img.height });
        img.onerror = () => resolve(imageFile);
      });
      acceptedFiles.push(await loadPromise);
    }

    if (rejectedSizeFiles.length > 0) {
      showNotification({
        type: 'warning',
        title: t('notifications.files_too_large.title'),
        message: t('notifications.files_too_large.message'),
        details: rejectedSizeFiles.map(f => f.name)
      });
    }

    if (processedHeic) {
      showNotification({ type: 'success', title: t('notifications.heic_conversion.title'), message: t('notifications.heic_conversion.message') });
    }

    if (rejectedHeicFiles.length > 0) {
      showNotification({ type: 'error', title: t('notifications.heic_error.title'), message: t('notifications.heic_error.message'), details: rejectedHeicFiles.map(f => f.name) });
    }

    if (acceptedFiles.length === 0) return;

    if (files.length > 0) {
      setPendingFiles(acceptedFiles);
      setIsAddFilesModalOpen(true);
    } else {
      setFiles(acceptedFiles);
      setSelectedFileIds(new Set(acceptedFiles.map(f => f.id)));
    }
  };

  const handleConfirmAddFiles = (mode: 'append' | 'replace') => {
    const newFileIds = new Set(pendingFiles.map(f => f.id));
    if (mode === 'replace') {
      files.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
        if (file.processedBlob) URL.revokeObjectURL(URL.createObjectURL(file.processedBlob));
      });
      setFiles(pendingFiles);
      setSelectedFileIds(newFileIds);
    } else {
      setFiles(prev => [...prev, ...pendingFiles]);
      setSelectedFileIds(prev => new Set([...prev, ...newFileIds]));
    }
    setPendingFiles([]);
    setIsAddFilesModalOpen(false);
  };

  const handleSelectionChange = (id: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === files.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map(f => f.id)));
    }
  };

  const deleteSingleFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    setFiles(prev => prev.filter(f => !selectedFileIds.has(f.id)));
    setSelectedFileIds(new Set());
  };

  const applyEditsToSelected = () => {
    if (!workerRef.current || selectedFileIds.size === 0) return;

    const filesToProcess = files.filter(f => selectedFileIds.has(f.id));
    setTotalInBatch(filesToProcess.length);
    setProcessedCount(0);
    setProcessingStatus('processing');
    setWatchdog();

    setFiles(prevFiles =>
      prevFiles.map(f =>
        selectedFileIds.has(f.id) ? { ...f, status: 'processing', processedBlob: undefined, newSize: undefined, errorMessage: undefined } : f
      )
    );

    filesToProcess.forEach(async (imageFile) => {
      const { id, file } = imageFile;
      const buffer = await file.arrayBuffer();

      let watermarkBitmap = null;
      if (settings.watermark.enabled && settings.watermark.type === 'image' && settings.watermark.imageFile) {
        watermarkBitmap = await createImageBitmap(settings.watermark.imageFile);
      }

      workerRef.current?.postMessage({
        type: 'PROCESS_IMAGE',
        id,
        buffer,
        fileType: file.type,
        settings,
        watermarkBitmap
      }, [buffer, watermarkBitmap].filter((x): x is Transferable => !!x));
    });
  };

  const handleDownload = async (filesToDownload: ImageFile[], format: 'zip' | 'pdf' | 'individual') => {
    if (filesToDownload.length === 0) return;

    // USAGE LIMIT CHECK
    try {
      await incrementUsage();
    } catch (error: any) {
      if (error.message === 'LIMIT_REACHED') {
        if (confirm('Limite diário atingido! Atualize para o plano PRO para downloads ilimitados.')) {
          router.push('/dashboard?upgrade=true');
        }
        return;
      }
    }

    if (format === 'zip') {
      const zip = new JSZip();
      filesToDownload.forEach(f => {
        if (f.processedBlob) {
          const ext = settings.outputFormat;
          const originalName = f.renamedFilename || f.file.name;
          const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
          zip.file(`${baseName}.${ext}`, f.processedBlob);
        }
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'images.zip');
    } else if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const { pageSize, orientation, imageFit } = settings.pdf;

      const pageDims = PageSizes[pageSize] || PageSizes.A4;
      const page_width = orientation === 'portrait' ? pageDims[0] : pageDims[1];
      const page_height = orientation === 'portrait' ? pageDims[1] : pageDims[0];

      for (const file of filesToDownload) {
        if (file.processedBlob) {
          const page = pdfDoc.addPage([page_width, page_height]);
          let image;
          if (file.processedBlob.type === 'image/jpeg') {
            image = await pdfDoc.embedJpg(await file.processedBlob.arrayBuffer());
          } else { // PNG
            image = await pdfDoc.embedPng(await file.processedBlob.arrayBuffer());
          }

          if (imageFit === 'stretch') {
            page.drawImage(image, { x: 0, y: 0, width: page_width, height: page_height });
          } else { // contain
            const imageDims = image.scaleToFit(page_width, page_height);
            page.drawImage(image, {
              x: (page_width - imageDims.width) / 2,
              y: (page_height - imageDims.height) / 2,
              width: imageDims.width,
              height: imageDims.height
            });
          }
        }
      }
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      saveAs(pdfBlob, 'document.pdf');
    } else { // individual
      filesToDownload.forEach(f => {
        if (f.processedBlob) {
          const ext = settings.outputFormat;
          const originalName = f.renamedFilename || f.file.name;
          const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
          saveAs(f.processedBlob, `${baseName}.${ext}`);
        }
      });
    }
  };

  const handleRenameFiles = (pattern: string, start: number) => {
    let counter = start;
    // const fileList = files.filter(f => selectedFileIds.has(f.id));

    setFiles(prevFiles => prevFiles.map(f => {
      if (selectedFileIds.has(f.id)) {
        const ext = f.file.name.slice(f.file.name.lastIndexOf('.'));
        const newName = pattern.replace(/\{num\}/g, String(counter)) + ext;
        counter++;
        return { ...f, renamedFilename: newName };
      }
      return f;
    }));
    setIsRenameModalOpen(false);
  };


  return (
    <div className={`min-h-screen flex flex-col ${theme}`}>
      {/* Header Removed */}

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 flex gap-8">
        <div className="w-1/3 2xl:w-1/4 hidden lg:block">
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onApplyEdits={applyEditsToSelected}
            isProcessing={processingStatus === 'processing'}
            selectedCount={selectedFileIds.size}
            processedCount={processedCount}
            totalInBatch={totalInBatch}
            processingStatus={processingStatus}
            previewFile={previewFile}
          />
        </div>

        <div className="flex-1 min-w-0 h-[calc(100vh-120px)]">
          {files.length > 0 ? (
            <ImageList
              files={files}
              selectedFileIds={selectedFileIds}
              settings={settings}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
              allSelected={selectedFileIds.size === files.length && files.length > 0}
              onFilesAdded={handleNewFiles}
              onDeleteSelected={handleDeleteSelected}
              onDeleteSingleFile={deleteSingleFile}
              onDownload={handleDownload}
              isProcessing={processingStatus === 'processing'}
              onOpenRenameModal={() => setIsRenameModalOpen(true)}
            />
          ) : (
            <FileUpload onFilesAdded={handleNewFiles} />
          )}
        </div>
      </main>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <AddFilesConfirmationModal
        isOpen={isAddFilesModalOpen}
        onClose={() => setIsAddFilesModalOpen(false)}
        onAppend={() => handleConfirmAddFiles('append')}
        onReplace={() => handleConfirmAddFiles('replace')}
      />
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameFiles}
        selectedCount={selectedFileIds.size}
      />
    </div>
  );
}