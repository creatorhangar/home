import React, { useState, useRef, useEffect } from 'react';
import { ImageFile } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: ImageFile[];
  onDownload: (url: string, filename: string) => void;
  onUpdateImage: (id: string, updates: Partial<ImageFile>) => void;
  onPreview: (id: string) => void;
  onRevert: (id: string) => void;
  onOpenGallery: (id: string) => void;
  globalPreviewBg: 'dark' | 'light' | 'checkerboard';
  onProcessImage: (id: string) => void;
}

const GAP = 24; // Corresponde a 'gap-6' no Tailwind

const ImageGrid: React.FC<ImageGridProps> = ({ images, ...props }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(0);
  const [gridParams, setGridParams] = useState({
    totalHeight: 0,
    paddingTop: 0,
    columnCount: 4,
    itemHeight: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const calculateLayout = () => {
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const rootTop = root.offsetTop;

      const width = root.offsetWidth;
      let cols = 1;
      if (width >= 1024) cols = 4;
      else if (width >= 768) cols = 3;
      else if (width >= 640) cols = 2;
      
      const itemWidth = (width - (cols - 1) * GAP) / cols;
      const itemHeight = itemWidth; // aspect-square
      const rowHeight = itemHeight + GAP;

      const totalRows = Math.ceil(images.length / cols);
      const totalHeight = totalRows * rowHeight - GAP;

      const relativeScrollTop = Math.max(0, scrollTop - rootTop);
      const firstVisibleRow = Math.floor(relativeScrollTop / rowHeight);
      
      const numVisibleRows = Math.ceil(viewportHeight / rowHeight);
      
      const buffer = 2; // Renderiza linhas extras para uma rolagem mais suave
      const startRow = Math.max(0, firstVisibleRow - buffer);
      const endRow = Math.min(totalRows, firstVisibleRow + numVisibleRows + buffer);

      const startIndex = startRow * cols;
      const endIndex = Math.min(images.length, endRow * cols);

      setVisibleStartIndex(startIndex);
      setVisibleEndIndex(endIndex);
      setGridParams({
        totalHeight,
        paddingTop: startRow * rowHeight,
        columnCount: cols,
        itemHeight: itemHeight,
      });
    };

    calculateLayout();

    const handleScrollAndResize = () => {
        requestAnimationFrame(calculateLayout);
    };

    window.addEventListener('scroll', handleScrollAndResize, { passive: true });
    window.addEventListener('resize', handleScrollAndResize);
    
    // Recalcula o layout se a lista de imagens mudar
    if (images.length > 0) {
      calculateLayout();
    }

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [images.length]);


  const visibleImages = images.slice(visibleStartIndex, visibleEndIndex);
  
  // Define a classe da grade dinamicamente com base no número de colunas calculado
  const gridColsClass = `grid-cols-${gridParams.columnCount}`;
  const gridClasses = `grid gap-6 ${
      gridParams.columnCount === 1 ? 'grid-cols-1' :
      gridParams.columnCount === 2 ? 'sm:grid-cols-2' :
      gridParams.columnCount === 3 ? 'md:grid-cols-3' :
      'lg:grid-cols-4'
  }`;


  return (
    <div ref={rootRef} style={{ height: `${gridParams.totalHeight}px`, position: 'relative' }}>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}
        style={{
          willChange: 'transform',
          transform: `translateY(${gridParams.paddingTop}px)`,
        }}
      >
        {visibleImages.map(image => (
          <ImageCard 
            key={image.id} 
            image={image}
            {...props}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;