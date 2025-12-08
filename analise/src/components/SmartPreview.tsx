import { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, X } from 'lucide-react';

interface SmartPreviewProps {
  originalFile: File;
  processedUrl: string;
  onDownload: () => void;
  onClose?: () => void;
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function SmartPreview({ originalFile, processedUrl, onDownload, onClose }: SmartPreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const loadOriginal = () => {
      const img = new Image();
      img.onload = () => setOriginalImage(img);
      img.src = URL.createObjectURL(originalFile);
    };

    const loadProcessed = () => {
      const img = new Image();
      img.onload = () => setProcessedImage(img);
      img.src = processedUrl;
    };

    loadOriginal();
    loadProcessed();

    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage.src);
    };
  }, [originalFile, processedUrl]);

  // Render canvases when images load
  useEffect(() => {
    if (!originalImage || !processedImage) return;

    const renderOriginal = () => {
      const canvas = originalCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match processed image dimensions
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enable high quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw original image scaled to processed dimensions (bicubic upscale)
      ctx.drawImage(originalImage, 0, 0, processedImage.width, processedImage.height);
    };

    const renderProcessed = () => {
      const canvas = processedCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;

      // Clear and draw processed image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(processedImage, 0, 0);
    };

    renderOriginal();
    renderProcessed();
  }, [originalImage, processedImage, viewport]);

  // Handle mouse events for synchronized pan and zoom
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900 mb-1">Smart Preview</h3>
          <p className="text-sm text-gray-500 font-normal">
            Compare Original vs AI Reconstruction
          </p>
        </div>
        
        {/* Controls - Floating in header for easier access on mobile, or stick to absolute as requested? 
            The design says "Position: absolute Top: 12px Right: 12px". 
            I will put them inside the main container relative to it.
        */}
        <div className="flex items-center gap-2">
          <button 
            onClick={zoomOut}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono min-w-[3.5rem] text-center text-gray-500">
            {Math.round(viewport.scale * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={resetViewport}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white/95 backdrop-blur hover:bg-gray-50 transition-all text-gray-600"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={onDownload} 
            className="ml-2 flex items-center gap-2 px-4 h-9 bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="ml-2 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all text-gray-500 hover:text-gray-700"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="grid grid-cols-2 gap-4 h-[400px] select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Original (Digital Zoom) */}
        <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-xs font-bold tracking-wide shadow-sm">
              Original Image
            </span>
          </div>
          <canvas
            ref={originalCanvasRef}
            style={canvasStyle}
            className="max-w-full max-h-full pointer-events-none"
          />
        </div>

        {/* Processed (AI Reconstruction) */}
        <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-xs font-bold tracking-wide shadow-sm">
              AI Reconstruction
            </span>
          </div>
          <canvas
            ref={processedCanvasRef}
            style={canvasStyle}
            className="max-w-full max-h-full pointer-events-none"
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[13px] text-gray-400 italic font-normal">
          Use mouse wheel to zoom • Drag to pan • Both sides are synchronized
        </p>
      </div>
    </div>
  );
}
