export const imageProcessorWorkerString = `
  let UTIF;

  const init = (utifPath) => {
    try {
      importScripts(utifPath);
      UTIF = self.UTIF;
    } catch (error) {
      console.error('Failed to load worker scripts:', error);
    }
  };
  
  const applyWatermark = (ctx, watermarkSettings, watermarkBitmap, imageWidth, imageHeight) => {
    if (!watermarkSettings.enabled) return;

    ctx.globalAlpha = watermarkSettings.opacity;
    const { type, text, size, color, position, mosaic, angle, offsetX, offsetY } = watermarkSettings;

    if (type === 'text') {
        const fontSize = (size / 100) * imageWidth;
        ctx.font = \`bold \${fontSize}px sans-serif\`;
        ctx.fillStyle = color;

        if (mosaic) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textMetrics = ctx.measureText(text);
            const patternWidth = textMetrics.width * 1.5;
            const patternHeight = fontSize * 3; 
            
            const radAngle = angle * Math.PI / 180;

            for (let y = -patternHeight; y < imageHeight + patternHeight; y += patternHeight) {
                for (let x = -patternWidth; x < imageWidth + patternWidth; x += patternWidth) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(radAngle);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
            }
            ctx.restore();
        } else {
            const margin = 0.02 * Math.min(imageWidth, imageHeight);
            const textMetrics = ctx.measureText(text);
            let x, y;

            if (position.includes('left')) {
                x = margin;
                ctx.textAlign = 'left';
            } else if (position.includes('center')) {
                x = imageWidth / 2;
                ctx.textAlign = 'center';
            } else { // right
                x = imageWidth - margin;
                ctx.textAlign = 'right';
            }

            if (position.includes('top')) {
                y = margin;
                ctx.textBaseline = 'top';
            } else if (position.includes('middle') || position === 'center') {
                y = imageHeight / 2;
                ctx.textBaseline = 'middle';
            } else { // bottom
                y = imageHeight - margin;
                ctx.textBaseline = 'bottom';
            }
            
            x += (offsetX / 100) * imageWidth;
            y += (offsetY / 100) * imageHeight;
            
            ctx.fillText(text, x, y);
        }

    } else if (type === 'image' && watermarkBitmap) {
        const margin = 0.02 * Math.min(imageWidth, imageHeight);
        const watermarkWidth = (size / 100) * imageWidth;
        const watermarkHeight = watermarkWidth * (watermarkBitmap.height / watermarkBitmap.width);
        
        let x, y;
        if (position.includes('left')) x = margin;
        else if (position.includes('center')) x = (imageWidth - watermarkWidth) / 2;
        else x = imageWidth - watermarkWidth - margin;

        if (position.includes('top')) y = margin;
        else if (position.includes('middle') || position === 'center') y = (imageHeight - watermarkHeight) / 2;
        else y = imageHeight - watermarkHeight - margin;

        x += (offsetX / 100) * imageWidth;
        y += (offsetY / 100) * imageHeight;

        ctx.drawImage(watermarkBitmap, x, y, watermarkWidth, watermarkHeight);
    }

    ctx.globalAlpha = 1.0;
    if(watermarkBitmap) watermarkBitmap.close();
  }

  const processImage = async (id, bitmap, buffer, fileType, settings, watermarkBitmap) => {
    if (!UTIF && (fileType === 'image/tiff' || settings.outputFormat === 'tiff')) {
        const errorMsg = 'TIFF library not initialized.';
        console.error(errorMsg);
        self.postMessage({ type: 'PROCESS_RESULT', id, error: errorMsg });
        return null;
    }
    
    let canvasSource;
    let createdBitmap = null;

    try {
        if (bitmap) {
            canvasSource = bitmap;
        } else if (buffer) {
            if (fileType === 'image/tiff' && UTIF) {
                try {
                    const ifds = UTIF.decode(buffer);
                    if (!ifds || ifds.length === 0) throw new Error('Invalid TIFF data.');
                    const firstPage = ifds[0];
                    UTIF.decodeImage(buffer, firstPage);
                    const rgba = UTIF.toRGBA8(firstPage);
                    if (!firstPage.width || !firstPage.height) throw new Error('Invalid TIFF dimensions.');
                    canvasSource = new ImageData(new Uint8ClampedArray(rgba), firstPage.width, firstPage.height);
                } catch (tiffError) {
                    console.error('Error decoding TIFF in worker:', tiffError);
                    throw new Error('tiff_error');
                }
            } else {
                const blob = new Blob([buffer], { type: fileType });
                createdBitmap = await createImageBitmap(blob);
                canvasSource = createdBitmap;
            }
        } else {
            throw new Error('No valid image data received.');
        }

        if (!canvasSource || typeof canvasSource.width !== 'number' || typeof canvasSource.height !== 'number' || canvasSource.width <= 0 || canvasSource.height <= 0) {
            throw new Error('Invalid source image data or dimensions.');
        }

        const sourceWidth = canvasSource.width;
        const sourceHeight = canvasSource.height;
        let targetWidth = sourceWidth;
        let targetHeight = sourceHeight;

        const { resize, resizeMode, resizeWidth, resizeHeight, resizeFit, rotation, watermark } = settings;

        if (resize) {
            if (resizeMode === 'percentage') {
                const percentage = resizeWidth || 100;
                if (percentage > 0 && percentage !== 100) {
                    targetWidth = sourceWidth * (percentage / 100);
                    targetHeight = sourceHeight * (percentage / 100);
                }
            } else { // pixels mode
                 const w = resizeWidth;
                 const h = resizeHeight;

                 if (w && h) {
                    targetWidth = w;
                    targetHeight = h;
                 } else if (w) {
                    targetWidth = w;
                    targetHeight = (w / sourceWidth) * sourceHeight;
                 } else if (h) {
                    targetHeight = h;
                    targetWidth = (h / sourceHeight) * sourceWidth;
                 }
            }
        }
        
        targetWidth = Math.max(1, Math.round(targetWidth));
        targetHeight = Math.max(1, Math.round(targetHeight));
        
        if (!isFinite(targetWidth) || !isFinite(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
            throw new Error(\`Invalid resize dimensions: \${targetWidth}x\${targetHeight}\`);
        }

        let canvasWidth = targetWidth;
        let canvasHeight = targetHeight;
        let finalNewWidth = targetWidth;
        let finalNewHeight = targetHeight;

        // Swap dimensions for 90/270 degree rotations
        if (rotation === 90 || rotation === 270) {
            canvasWidth = targetHeight;
            canvasHeight = targetWidth;
            finalNewWidth = targetHeight;
            finalNewHeight = targetWidth;
        } else {
            finalNewWidth = targetWidth;
            finalNewHeight = targetHeight;
        }

        const offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not create 2D canvas context.');
        }
        
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        if (rotation && rotation > 0) {
            ctx.rotate(rotation * Math.PI / 180);
        }
        ctx.translate(-targetWidth / 2, -targetHeight / 2);
        
        if (settings.outputFormat !== 'png') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 2, canvasHeight * 2);
        }
        
        if (resize && resizeMode === 'pixels' && (resizeWidth || resizeHeight)) {
            const sourceRatio = sourceWidth / sourceHeight;
            const targetRatio = targetWidth / targetHeight;
            let sx = 0, sy = 0, sWidth = sourceWidth, sHeight = sourceHeight;

            if (resizeFit === 'cover') {
                if (sourceRatio > targetRatio) {
                    sWidth = sourceHeight * targetRatio;
                    sx = (sourceWidth - sWidth) / 2;
                } else {
                    sHeight = sourceWidth / targetRatio;
                    sy = (sourceHeight - sHeight) / 2;
                }
                ctx.drawImage(canvasSource, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
            } else if (resizeFit === 'contain' || resizeFit === 'smart-fill') {
                let dx = 0, dy = 0, dWidth = targetWidth, dHeight = targetHeight;
                if (sourceRatio > targetRatio) {
                    dHeight = targetWidth / sourceRatio;
                    dy = (targetHeight - dHeight) / 2;
                } else {
                    dWidth = targetHeight * sourceRatio;
                    dx = (targetWidth - dWidth) / 2;
                }

                if (resizeFit === 'smart-fill') {
                    if (dy > 0) {
                        ctx.drawImage(canvasSource, 0, 0, sourceWidth, 1, 0, 0, targetWidth, dy);
                        ctx.drawImage(canvasSource, 0, sourceHeight - 1, sourceWidth, 1, 0, dy + dHeight, targetWidth, targetHeight - (dy + dHeight));
                    }
                    if (dx > 0) {
                        ctx.drawImage(canvasSource, 0, 0, 1, sourceHeight, 0, 0, dx, targetHeight);
                        ctx.drawImage(canvasSource, sourceWidth - 1, 0, 1, sourceHeight, dx + dWidth, 0, targetWidth - (dx + dWidth), targetHeight);
                    }
                }
                
                ctx.drawImage(canvasSource, 0, 0, sourceWidth, sourceHeight, dx, dy, dWidth, dHeight);
            } else { // 'fill'
                ctx.drawImage(canvasSource, 0, 0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
            }

        } else {
            ctx.drawImage(canvasSource, 0, 0, targetWidth, targetHeight);
        }
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        applyWatermark(ctx, watermark, watermarkBitmap, canvasWidth, canvasHeight);
        
        let finalBlob;
        const { outputFormat, quality } = settings;

        if (outputFormat === 'tiff') {
            if (!UTIF) throw new Error('TIFF library not available for encoding.');
            try {
                const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                const tiffBuffer = UTIF.encodeImage(imageData.data.buffer, offscreenCanvas.width, offscreenCanvas.height);
                finalBlob = new Blob([tiffBuffer], { type: 'image/tiff' });
            } catch (tiffError) {
                console.error('Error generating TIFF:', tiffError);
                throw new Error('tiff_error');
            }
        } else {
            const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : \`image/\${outputFormat}\`;
            const qualityValue = (outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'avif') ? quality / 100 : undefined;
            
            try {
                 finalBlob = await offscreenCanvas.convertToBlob({
                    type: mimeType,
                    quality: qualityValue,
                });
            } catch(e) {
                console.error('convertToBlob failed:', e);
                throw new Error('Failed to create image. Image may be too large.');
            }
        }
        
        return { blob: finalBlob, newWidth: finalNewWidth, newHeight: finalNewHeight };

    } finally {
        if (bitmap && typeof bitmap.close === 'function') bitmap.close();
        if (createdBitmap && typeof createdBitmap.close === 'function') createdBitmap.close();
    }
  };

  self.onmessage = async (e) => {
    const { type, id, bitmap, buffer, fileType, settings, utifPath, watermarkBitmap } = e.data;

    if (type === 'INIT') {
      init(utifPath);
      return;
    }
    
    try {
      const result = await processImage(id, bitmap, buffer, fileType, settings, watermarkBitmap);
      if (!result) return; // Error was already handled inside

      self.postMessage({ type: 'PROCESS_RESULT', id, blob: result.blob, newWidth: result.newWidth, newHeight: result.newHeight });
      
    } catch (error) {
        console.error('Error processing image in worker for id ' + id + ':', error);
        self.postMessage({ type: 'PROCESS_RESULT', id, error: error.message });
    }
  };
`;