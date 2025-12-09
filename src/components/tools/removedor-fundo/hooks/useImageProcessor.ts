import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { ImageFile, ImageStatus, ConfiguracaoExportacao } from '../types';
import { removeBackgroundClientSide, RemovalOptions } from '../utils/imageProcessor';
import { toastEventManager } from '../utils/fileUtils';
import * as idb from '../utils/idb';


/**
 * Hook customizado para gerenciar todo o ciclo de vida do processamento de imagens.
 * @returns Um objeto com o estado das imagens e funções para manipulá-las.
 */
export const useImageProcessor = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDBLoading, setIsDBLoading] = useState(true);

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  
  // Carrega as imagens do IndexedDB na montagem do componente.
  useEffect(() => {
    let unmounted = false;
    idb.getImages().then(storedImages => {
        if (unmounted) return;
        const loadedImages = storedImages.map(img => ({
            ...img,
            originalURL: URL.createObjectURL(img.file), // Recria a URL do objeto.
        }));
        setImages(loadedImages);
    }).catch(err => {
        console.error("Failed to load images from DB", err);
    }).finally(() => {
        if (!unmounted) {
            setIsDBLoading(false);
        }
    });

    return () => {
        unmounted = true;
        // Limpa as URLs de objeto criadas para evitar vazamentos de memória.
        imagesRef.current.forEach(img => {
            if (img.originalURL.startsWith('blob:')) {
                URL.revokeObjectURL(img.originalURL);
            }
        });
    };
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez.

  /**
   * Atualiza uma imagem específica no array de estado e no IndexedDB.
   * @param id - O ID da imagem a ser atualizada.
   * @param updates - Um objeto com as propriedades a serem atualizadas.
   */
  const updateImage = useCallback((id: string, updates: Partial<ImageFile>) => {
    let updatedImage: ImageFile | undefined;
    
    setImages(prev =>
      prev.map(img => {
        if (img.id === id) {
          const newUpdates = { ...updates };
          // Se um novo arquivo for fornecido (após um corte), atualize a URL.
          if (newUpdates.file && newUpdates.file !== img.file) {
              URL.revokeObjectURL(img.originalURL); // Limpa a URL antiga.
              newUpdates.originalURL = URL.createObjectURL(newUpdates.file);
          }
          updatedImage = { ...img, ...newUpdates };
          return updatedImage;
        }
        return img;
      })
    );
    
    // Após a atualização do estado, persiste a alteração no IndexedDB.
    if (updatedImage) {
        // A URL do objeto não deve ser persistida, apenas os dados serializáveis.
        const { originalURL, ...imageToSave } = updatedImage;
        idb.saveImage(imageToSave);
    }
  }, []);

  /**
   * Reverte uma imagem processada para o estado pendente, permitindo reprocessamento.
   * @param id - O ID da imagem a ser revertida.
   */
  const revertImage = useCallback((id: string) => {
    updateImage(id, { status: ImageStatus.Pending, processedURL: null, error: null, removalInfo: undefined });
  }, [updateImage]);
  
  /**
   * Reverte todas as imagens processadas ou com erro para o estado pendente.
   */
  const revertAll = useCallback(() => {
    const imagesToRevert = imagesRef.current.filter(
      img => img.status === ImageStatus.Done || img.status === ImageStatus.Error
    );
    if (imagesToRevert.length === 0) return;

    const revertedImages = imagesRef.current.map(img => {
      if (img.status === ImageStatus.Done || img.status === ImageStatus.Error) {
        const revertedImg = {
          ...img,
          status: ImageStatus.Pending,
          processedURL: null,
          error: null,
          removalInfo: undefined, // Reseta para permitir nova detecção automática
        };
        // Persiste a alteração no DB
        const { originalURL, ...imageToSave } = revertedImg;
        idb.saveImage(imageToSave);
        return revertedImg;
      }
      return img;
    });

    setImages(revertedImages);
    toastEventManager.emit('toasts.revertedAll', 'info', { count: imagesToRevert.length });
  }, []);


  /**
   * Adiciona novos arquivos de imagem ao estado e ao IndexedDB.
   * @param files - Uma `FileList` (geralmente de um input de arquivo ou drag-and-drop).
   * @returns `true` se algum arquivo inválido foi ignorado.
   */
  const addImages = useCallback((files: FileList): boolean => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allFiles = Array.from(files);
    
    const validFiles = allFiles.filter(file => validImageTypes.includes(file.type));
    const invalidFiles = allFiles.filter(file => !validImageTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toastEventManager.emit('toasts.ignoredFiles', 'error', { files: invalidFiles.map(f => f.name).join(', ') });
    }

    const filesToAdd = validFiles;
    
    const newImages: ImageFile[] = filesToAdd
      .map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        originalURL: URL.createObjectURL(file),
        processedURL: null,
        status: ImageStatus.Pending,
        error: null,
      }));

    if (newImages.length === 0) return invalidFiles.length > 0;

    setImages(prev => [...prev, ...newImages]);
    
    // Salva as novas imagens no IndexedDB.
    newImages.forEach(img => {
      const { originalURL, ...imageToSave } = img;
      idb.saveImage(imageToSave);
    });

    return invalidFiles.length > 0;
  }, []);

  /**
   * Processa todas as imagens que estão com o status 'Pending'.
   */
  const processPendingImages = useCallback(async (options: RemovalOptions) => {
    const imagesToProcess = imagesRef.current.filter(img => img.status === ImageStatus.Pending);
    if (imagesToProcess.length === 0) return;

    setIsProcessing(true);
    
    const processingIds = new Set(imagesToProcess.map(img => img.id));
    setImages(prev => prev.map(img => 
        processingIds.has(img.id) ? { ...img, status: ImageStatus.Processing, progress: { stage: 'inicial', pct: 0 } } : img
    ));

    const concurrency = Math.min(3, Math.max(1, navigator.hardwareConcurrency ? Math.floor(navigator.hardwareConcurrency / 4) : 2));
    let index = 0;
    let successCount = 0;

    const worker = async () => {
      while (index < imagesToProcess.length) {
        const current = imagesToProcess[index++];
        try {
          const resultBase64 = await removeBackgroundClientSide(
            current.originalURL,
            { ...options, ...(current.customOptions || {}), removalInfo: current.removalInfo },
            (evt) => {
              updateImage(current.id, { progress: { stage: evt.stage, iter: evt.iter, pct: Math.min(100, Math.max(0, Math.round((evt.progress || 0) * 100))) } });
            }
          );
          const processedURL = `data:image/png;base64,${resultBase64}`;
          updateImage(current.id, { status: ImageStatus.Done, processedURL, progress: undefined });
          successCount++;
        } catch (error: any) {
          updateImage(current.id, { status: ImageStatus.Error, error: error.message || 'Ocorreu um erro desconhecido.', progress: undefined });
        }
      }
    };

    const workers = Array.from({ length: concurrency }).map(() => worker());
    await Promise.all(workers);

    setIsProcessing(false);
    if (successCount > 0) {
      if (successCount === 1) {
        toastEventManager.emit('toasts.imageReady', 'success', { fileName: imagesToProcess[0].file.name });
      } else {
        toastEventManager.emit('toasts.imagesReady', 'success', { count: successCount });
      }
    }
  }, [updateImage]);

  const processImageById = useCallback(async (id: string, options: RemovalOptions) => {
    const img = imagesRef.current.find(i => i.id === id);
    if (!img || img.status === ImageStatus.Processing) return;
    setImages(prev => prev.map(i => i.id === id ? { ...i, status: ImageStatus.Processing, progress: { stage: 'inicial', pct: 0 } } : i));
    try {
      const resultBase64 = await removeBackgroundClientSide(
        img.originalURL,
        { ...options, ...(img.customOptions || {}), removalInfo: img.removalInfo },
        (evt) => {
          updateImage(id, { progress: { stage: evt.stage, iter: evt.iter, pct: Math.min(100, Math.max(0, Math.round((evt.progress || 0) * 100))) } });
        }
      );
      const processedURL = `data:image/png;base64,${resultBase64}`;
      updateImage(id, { status: ImageStatus.Done, processedURL, progress: undefined });
    } catch (error: any) {
      updateImage(id, { status: ImageStatus.Error, error: error.message || 'Ocorreu um erro desconhecido.', progress: undefined });
    }
  }, [updateImage]);
  
  const pendingImages = useMemo(() => images.filter(img => img.status === ImageStatus.Pending), [images]);

  /**
   * Baixa uma única imagem.
   * @param url - A URL da imagem a ser baixada (geralmente uma data URL).
   * @param filename - O nome do arquivo para o download.
   */
  const downloadImage = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  /**
   * Limpa todas as imagens do estado, revoga suas URLs e limpa o IndexedDB.
   */
  const clearAll = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalURL);
    });
    setImages([]);
    idb.clearImages();
  }, [images]);

  /**
   * Baixa todas as imagens processadas como um arquivo .zip.
   */
  const downloadAllAsZip = useCallback(async () => {
    if (typeof JSZip === 'undefined') {
      toastEventManager.emit("toasts.zipError", 'error');
      console.error('JSZip library is not loaded.');
      return;
    }
    const zip = new JSZip();
    const imagesToDownload = images.filter(img => img.status === 'done' && img.processedURL);

    for (const image of imagesToDownload) {
        const originalName = image.file.name.split('.').slice(0, -1).join('.');
        const filename = `${originalName}_sem_fundo.png`;
        const response = await fetch(image.processedURL!);
        const blob = await response.blob();
        zip.file(filename, blob);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'imagens_processadas.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  }, [images]);

  const exportarLote = useCallback(async (config: ConfiguracaoExportacao, onProgress?: (current: number, total: number) => void) => {
    if (typeof JSZip === 'undefined') {
      toastEventManager.emit("toasts.zipError", 'error');
      return;
    }
    const zip = new JSZip();
    const imagesToExport = images.filter(img => img.status === ImageStatus.Done && img.processedURL);
    const presets: Record<string, { w: number; h: number }> = {
      '1:1': { w: 1080, h: 1080 },
      '4:5': { w: 1080, h: 1350 },
      '16:9': { w: 1920, h: 1080 },
      '9:16': { w: 1080, h: 1920 },
      '3:4': { w: 1080, h: 1440 },
      '4:3': { w: 1440, h: 1080 },
      '2:3': { w: 1000, h: 1500 },
      '21:9': { w: 2560, h: 1080 },
      '1.91:1': { w: 1200, h: 628 },
    };
    const cores = (() => {
      if (config.fundos.tipo === 'cor-solida' && config.fundos.corSolida) return [config.fundos.corSolida];
      if (config.fundos.tipo === 'cores-personalizadas') return config.fundos.coresPersonalizadas || [];
      return [];
    })();
    let ultimaCor: string | null = null;
    const getColorForIndex = (index: number): string | null => {
      if (config.fundos.tipo === 'quadriculado' || config.fundos.tipo === 'branco' || config.fundos.tipo === 'preto') return null;
      if (!cores.length) return '#FFFFFF';
      if (config.fundos.modoAplicacao === 'aleatorio') {
        let c = cores[Math.floor(Math.random() * cores.length)];
        if (cores.length > 1) {
          while (c === ultimaCor) c = cores[Math.floor(Math.random() * cores.length)];
        }
        ultimaCor = c;
        return c;
      }
      return cores[index % cores.length];
    };
    const getTargetSize = (img: HTMLImageElement): { width: number; height: number } => {
      if (config.dimensoes.modo === 'original') return { width: img.naturalWidth, height: img.naturalHeight };
      if (config.dimensoes.modo === 'preset' && config.dimensoes.preset) {
        const p = presets[config.dimensoes.preset];
        return { width: p.w, height: p.h };
      }
      const w = Math.max(100, Math.min(10000, config.dimensoes.custom?.width || 1080));
      const h = Math.max(100, Math.min(10000, config.dimensoes.custom?.height || 1350));
      return { width: w, height: h };
    };
    const calcularEncaixe = (imgW: number, imgH: number, canvasW: number, canvasH: number, padding: number, mode: 'contain' | 'cover' | 'fill', manterProporcao: boolean) => {
      const areaW = Math.max(0, canvasW - padding * 2);
      const areaH = Math.max(0, canvasH - padding * 2);
      let width = canvasW, height = canvasH;
      if (mode === 'contain') {
        const scale = Math.min(areaW / imgW, areaH / imgH);
        width = imgW * scale;
        height = imgH * scale;
      } else if (mode === 'cover') {
        const scale = Math.max(canvasW / imgW, canvasH / imgH);
        width = imgW * scale;
        height = imgH * scale;
      } else if (mode === 'fill' && manterProporcao) {
        const scale = Math.max(canvasW / imgW, canvasH / imgH);
        width = imgW * scale;
        height = imgH * scale;
      }
      const x = Math.floor((canvasW - width) / 2);
      const y = Math.floor((canvasH - height) / 2);
      return { x, y, width, height };
    };
    for (let i = 0; i < imagesToExport.length; i++) {
      const image = imagesToExport[i];
      const imgEl = new Image();
      imgEl.src = image.processedURL!;
      await new Promise<void>((resolve) => { imgEl.onload = () => resolve(); });
      const { width: targetW, height: targetH } = getTargetSize(imgEl);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = getColorForIndex(i);
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (config.formato.tipo === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const padding = Math.max(0, Math.min(50, config.ajustes.padding));
      const bounds = calcularEncaixe(imgEl.naturalWidth, imgEl.naturalHeight, canvas.width, canvas.height, padding, config.ajustes.fitMode, !!config.ajustes.manterProporcao);
      if (config.circle?.enabled) {
        const cx = Math.floor(canvas.width / 2);
        const cy = Math.floor(canvas.height / 2);
        const r = Math.floor(Math.min(canvas.width, canvas.height) / 2) - Math.floor((config.circle.borderWidth || 0) / 2);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgEl, bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
        if ((config.circle.borderWidth || 0) > 0) {
          ctx.strokeStyle = config.circle.borderColor || '#ffffff';
          ctx.lineWidth = config.circle.borderWidth || 0;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.drawImage(imgEl, bounds.x, bounds.y, bounds.width, bounds.height);
      }
      const originalName = image.file.name.split('.').slice(0, -1).join('.');
      const filename = `${originalName}.` + (config.formato.tipo === 'png' ? 'png' : 'jpg');
      const blob: Blob | null = await new Promise((resolve) => {
        if (config.formato.tipo === 'png') {
          canvas.toBlob(resolve, 'image/png');
        } else {
          canvas.toBlob(resolve, 'image/jpeg', (config.formato.qualidade || 90) / 100);
        }
      });
      if (blob) zip.file(filename, blob);
      if (onProgress) onProgress(i + 1, imagesToExport.length);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'imagens_exportadas.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images]);

  const exportarImagem = useCallback(async (id: string, config: ConfiguracaoExportacao): Promise<void> => {
    const image = images.find(i => i.id === id && i.status === ImageStatus.Done && i.processedURL);
    if (!image) return;
    const presets: Record<string, { w: number; h: number }> = {
      '1:1': { w: 1080, h: 1080 },
      '4:5': { w: 1080, h: 1350 },
      '16:9': { w: 1920, h: 1080 },
      '9:16': { w: 1080, h: 1920 },
      '3:4': { w: 1080, h: 1440 },
      '4:3': { w: 1440, h: 1080 },
      '2:3': { w: 1000, h: 1500 },
      '21:9': { w: 2560, h: 1080 },
      '1.91:1': { w: 1200, h: 628 },
    };
    const cores = (() => {
      if (config.fundos.tipo === 'cor-solida' && config.fundos.corSolida) return [config.fundos.corSolida];
      if (config.fundos.tipo === 'cores-personalizadas') return config.fundos.coresPersonalizadas || [];
      return [];
    })();
    const getColorForIndex = (): string | null => {
      if (config.fundos.tipo === 'quadriculado' || config.fundos.tipo === 'branco' || config.fundos.tipo === 'preto') return null;
      if (!cores.length) return '#FFFFFF';
      return cores[0];
    };
    const imgEl = new Image();
    imgEl.src = image.processedURL!;
    await new Promise<void>((resolve) => { imgEl.onload = () => resolve(); });
    const getTargetSize = (img: HTMLImageElement): { width: number; height: number } => {
      if (config.dimensoes.modo === 'original') return { width: img.naturalWidth, height: img.naturalHeight };
      if (config.dimensoes.modo === 'preset' && config.dimensoes.preset) {
        const p = presets[config.dimensoes.preset];
        return { width: p.w, height: p.h };
      }
      const w = Math.max(100, Math.min(10000, config.dimensoes.custom?.width || 1080));
      const h = Math.max(100, Math.min(10000, config.dimensoes.custom?.height || 1350));
      return { width: w, height: h };
    };
    const { width: targetW, height: targetH } = getTargetSize(imgEl);
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bg = getColorForIndex();
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (config.formato.tipo === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const calcularEncaixeSingle = (imgW: number, imgH: number, canvasW: number, canvasH: number, padding: number, mode: 'contain' | 'cover' | 'fill', manterProporcao: boolean) => {
      const areaW = Math.max(0, canvasW - padding * 2);
      const areaH = Math.max(0, canvasH - padding * 2);
      let width = canvasW, height = canvasH;
      if (mode === 'contain') {
        const scale = Math.min(areaW / imgW, areaH / imgH);
        width = imgW * scale;
        height = imgH * scale;
      } else if (mode === 'cover' || (mode === 'fill' && manterProporcao)) {
        const scale = Math.max(canvasW / imgW, canvasH / imgH);
        width = imgW * scale;
        height = imgH * scale;
      }
      const x = Math.floor((canvasW - width) / 2);
      const y = Math.floor((canvasH - height) / 2);
      return { x, y, width, height };
    };
    const padding = Math.max(0, Math.min(50, config.ajustes.padding));
    const bounds = calcularEncaixeSingle(imgEl.naturalWidth, imgEl.naturalHeight, canvas.width, canvas.height, padding, config.ajustes.fitMode, !!config.ajustes.manterProporcao);
    if (config.circle?.enabled) {
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      const r = Math.floor(Math.min(canvas.width, canvas.height) / 2) - Math.floor((config.circle.borderWidth || 0) / 2);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(imgEl, bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
      if ((config.circle.borderWidth || 0) > 0) {
        ctx.strokeStyle = config.circle.borderColor || '#ffffff';
        ctx.lineWidth = config.circle.borderWidth || 0;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.drawImage(imgEl, bounds.x, bounds.y, bounds.width, bounds.height);
    }
    const originalName = image.file.name.split('.').slice(0, -1).join('.');
    const filename = `${originalName}.` + (config.formato.tipo === 'png' ? 'png' : 'jpg');
    const blob: Blob | null = await new Promise((resolve) => {
      if (config.formato.tipo === 'png') {
        canvas.toBlob(resolve, 'image/png');
      } else {
        canvas.toBlob(resolve, 'image/jpeg', (config.formato.qualidade || 90) / 100);
      }
    });
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images]);

  return {
    images,
    isProcessing,
    isDBLoading,
    pendingImages,
    addImages,
    processPendingImages,
    processImageById,
    downloadAllAsZip,
    exportarLote,
    exportarImagem,
    clearAll,
    downloadImage,
    revertImage,
    revertAll,
    updateImage,
  };
};