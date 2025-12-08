import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw, Download, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface AdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalFile: File;
  processedUrl: string;
  onDownload: (adjustedBlob: Blob) => void;
  onApply?: (adjustedBlob: Blob) => void;
  fileName: string;
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface AdjustSettings {
  contrast: number;
  vibrance: number;
  grain: number;
}

// Max preview size for performance
const MAX_PREVIEW_SIZE = 600;

export function AdjustModal({ isOpen, onClose, processedUrl, onDownload, onApply, fileName }: AdjustModalProps) {
  const [settings, setSettings] = useState<AdjustSettings>({
    contrast: 0,
    vibrance: 0,
    grain: 0
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const adjustedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullResCanvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  
  // Zoom and pan state
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !processedUrl) return;
    
    const img = new Image();
    img.onload = () => {
      setProcessedImage(img);
      // Calculate preview scale
      const scale = Math.min(MAX_PREVIEW_SIZE / img.width, MAX_PREVIEW_SIZE / img.height, 1);
      setPreviewScale(scale);
    };
    img.src = processedUrl;
  }, [isOpen, processedUrl]);

  useEffect(() => {
    if (!processedImage || !isOpen) return;

    const previewWidth = Math.round(processedImage.width * previewScale);
    const previewHeight = Math.round(processedImage.height * previewScale);

    const renderOriginal = () => {
      const canvas = originalCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = previewWidth;
      canvas.height = previewHeight;
      ctx.drawImage(processedImage, 0, 0, previewWidth, previewHeight);
    };

    const renderAdjusted = () => {
      const canvas = adjustedCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = previewWidth;
      canvas.height = previewHeight;
      ctx.drawImage(processedImage, 0, 0, previewWidth, previewHeight);
      
      if (settings.contrast !== 0 || settings.vibrance !== 0 || settings.grain !== 0) {
        applyAdjustments(ctx, previewWidth, previewHeight);
      }
    };

    renderOriginal();
    renderAdjusted();
  }, [processedImage, settings, isOpen, previewScale]);

  // Zoom and pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setViewport(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, viewport.scale * delta));
    
    setViewport(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [viewport.scale]);

  const resetViewport = () => {
    setViewport({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  const zoomIn = () => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(5, prev.scale * 1.2)
    }));
  };

  const zoomOut = () => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.8)
    }));
  };

  const canvasStyle = {
    transform: `scale(${viewport.scale}) translate(${viewport.offsetX / viewport.scale}px, ${viewport.offsetY / viewport.scale}px)`,
    transformOrigin: 'center center',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const applyAdjustments = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    
    if (settings.contrast !== 0) {
      applyContrastFilter(imageData, settings.contrast);
    }
    
    if (settings.vibrance !== 0) {
      applyVibranceFilter(imageData, settings.vibrance);
    }
    
    if (settings.grain !== 0) {
      applyFilmGrain(imageData, settings.grain);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [settings]);

  const applyContrastFilter = (imageData: ImageData, amount: number) => {
    const data = imageData.data;
    const factor = (259 * (amount * 255 + 255)) / (255 * (259 - amount * 255));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
  };

  const applyVibranceFilter = (imageData: ImageData, amount: number) => {
    const data = imageData.data;
    const adjustment = amount * -1;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;
      const amt = ((Math.abs(max - avg) * 2) / 255) * adjustment;
      
      if (r !== max) data[i] = Math.min(255, Math.max(0, data[i] + (max - r) * amt));
      if (g !== max) data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (max - g) * amt));
      if (b !== max) data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (max - b) * amt));
    }
  };

  // Film grain effect - adds subtle, cinematic noise
  const applyFilmGrain = (imageData: ImageData, intensity: number) => {
    const data = imageData.data;
    const grainAmount = intensity * 25; // Max ~25 grain variation
    
    for (let i = 0; i < data.length; i += 4) {
      // Generate random grain with slight bias toward luminance
      const grain = (Math.random() - 0.5) * grainAmount;
      const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      
      // Apply more grain to midtones, less to shadows/highlights (film-like)
      const midtoneFactor = 1 - Math.abs(luminance - 0.5) * 2;
      const adjustedGrain = grain * (0.5 + midtoneFactor * 0.5);
      
      data[i] = Math.min(255, Math.max(0, data[i] + adjustedGrain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustedGrain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustedGrain));
    }
  };

  const handleReset = () => {
    setSettings({ contrast: 0, vibrance: 0, grain: 0 });
  };

  const hasChanges = settings.contrast !== 0 || settings.vibrance !== 0 || settings.grain !== 0;

  // Generate full resolution output
  const generateFullResBlob = async (): Promise<Blob> => {
    if (!processedImage) throw new Error('No image loaded');
    
    const canvas = fullResCanvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failed');
    
    canvas.width = processedImage.width;
    canvas.height = processedImage.height;
    ctx.drawImage(processedImage, 0, 0);
    
    if (hasChanges) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (settings.contrast !== 0) applyContrastFilter(imageData, settings.contrast);
      if (settings.vibrance !== 0) applyVibranceFilter(imageData, settings.vibrance);
      if (settings.grain !== 0) applyFilmGrain(imageData, settings.grain);
      ctx.putImageData(imageData, 0, 0);
    }
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image'));
      }, 'image/png');
    });
  };

  const handleApply = async () => {
    if (!onApply || !hasChanges) return;
    
    setIsProcessing(true);
    try {
      const blob = await generateFullResBlob();
      onApply(blob);
      onClose();
    } catch (error) {
      console.error('Error applying adjustments:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyAndDownload = async () => {
    setIsProcessing(true);
    try {
      const blob = await generateFullResBlob();
      onDownload(blob);
      onClose();
    } catch (error) {
      console.error('Error generating adjusted image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-gray-900">Adjust Image</h2>
            <p className="text-[12px] text-gray-500 mt-0.5 truncate">{fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={zoomOut}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-mono min-w-[3rem] text-center text-gray-500">
              {Math.round(viewport.scale * 100)}%
            </span>
            <button 
              onClick={zoomIn}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={resetViewport}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Preview Area - Compact */}
          <div 
            ref={containerRef}
            className="grid grid-cols-2 gap-4 mb-6 h-[300px] select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Original</p>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center aspect-[4/3]">
                <canvas
                  ref={originalCanvasRef}
                  style={canvasStyle}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Preview</p>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center aspect-[4/3]">
                <canvas
                  ref={adjustedCanvasRef}
                  style={canvasStyle}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-[11px] text-gray-400 italic font-normal">
              Use mouse wheel to zoom • Drag to pan • Both sides are synchronized
            </p>
          </div>

          {/* Controls - Compact */}
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-900">Contrast</label>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{settings.contrast.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={settings.contrast}
                onChange={(e) => setSettings(prev => ({ ...prev, contrast: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#4338CA]"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Flat</span>
                <span>Punchy</span>
              </div>
            </div>

            {/* Vibrance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-900">Color Boost</label>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{settings.vibrance.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.1"
                value={settings.vibrance}
                onChange={(e) => setSettings(prev => ({ ...prev, vibrance: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#4338CA]"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Muted</span>
                <span>Vivid</span>
              </div>
            </div>

            {/* Film Grain */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-900">Film Grain</label>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{settings.grain.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.1"
                value={settings.grain}
                onChange={(e) => setSettings(prev => ({ ...prev, grain: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#4338CA]"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>None</span>
                <span>Cinematic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {onApply && (
              <button
                onClick={handleApply}
                disabled={isProcessing || !hasChanges}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#4338CA] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Apply
              </button>
            )}
            <button
              onClick={handleApplyAndDownload}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg shadow-sm disabled:opacity-50 transition-all"
            >
              <Download className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Download'}
            </button>
          </div>
        </div>
        
        {/* Hidden canvas for full-res export */}
        <canvas ref={fullResCanvasRef} className="hidden" />
      </div>
    </div>
  );
}
