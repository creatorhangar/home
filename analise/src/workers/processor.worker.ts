/* eslint-disable no-restricted-globals */


// Professional Unsharp Mask implementation (like Photoshop)
function applyUnsharpMask(imageData: ImageData, amount: number = 1.0, radius: number = 1.0, threshold: number = 0): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = new Uint8ClampedArray(data);
  
  // Create Gaussian blur for unsharp mask
  const blurred = gaussianBlur(imageData, radius);
  
  // Apply unsharp mask formula: original + amount * (original - blurred)
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) { // RGB channels
      const original = data[i + c];
      const blur = blurred.data[i + c];
      const diff = original - blur;
      
      // Apply threshold
      if (Math.abs(diff) >= threshold) {
        const sharpened = original + amount * diff;
        output[i + c] = Math.min(255, Math.max(0, sharpened));
      } else {
        output[i + c] = original;
      }
    }
    output[i + 3] = data[i + 3]; // Alpha channel unchanged
  }
  
  return new ImageData(output, w, h);
}

// Gaussian Blur for Unsharp Mask
function gaussianBlur(imageData: ImageData, radius: number): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = new Uint8ClampedArray(data);
  
  // Create Gaussian kernel
  const kernelSize = Math.ceil(radius * 2) * 2 + 1;
  const kernel = [];
  let sum = 0;
  
  for (let i = 0; i < kernelSize; i++) {
    const x = i - Math.floor(kernelSize / 2);
    const value = Math.exp(-(x * x) / (2 * radius * radius));
    kernel.push(value);
    sum += value;
  }
  
  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }
  
  // Apply horizontal blur
  const temp = new Uint8ClampedArray(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let k = 0; k < kernelSize; k++) {
          const kx = x + k - Math.floor(kernelSize / 2);
          if (kx >= 0 && kx < w) {
            sum += data[(y * w + kx) * 4 + c] * kernel[k];
          }
        }
        temp[idx + c] = sum;
      }
      temp[idx + 3] = data[idx + 3];
    }
  }
  
  // Apply vertical blur
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let k = 0; k < kernelSize; k++) {
          const ky = y + k - Math.floor(kernelSize / 2);
          if (ky >= 0 && ky < h) {
            sum += temp[(ky * w + x) * 4 + c] * kernel[k];
          }
        }
        output[idx + c] = sum;
      }
      output[idx + 3] = temp[idx + 3];
    }
  }
  
  return new ImageData(output, w, h);
}

// Enhanced sharpening filter with multiple kernel options
function applySharpenFilter(imageData: ImageData, intensity: number = 1.0, type: 'standard' | 'strong' | 'subtle' = 'standard'): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = new Uint8ClampedArray(data);
  
  // Different sharpening kernels
  let kernel: number[];
  
  switch (type) {
    case 'subtle':
      kernel = [
        0, -0.2, 0,
        -0.2, 1.8, -0.2,
        0, -0.2, 0
      ];
      break;
    case 'strong':
      kernel = [
        -1, -1, -1,
        -1, 9, -1,
        -1, -1, -1
      ];
      break;
    default: // standard
      kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];
  }
  
  // Apply intensity scaling
  for (let i = 0; i < kernel.length; i++) {
    if (i === 4) { // center element
      kernel[i] = 1 + (kernel[i] - 1) * intensity;
    } else {
      kernel[i] *= intensity;
    }
  }
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ki = ((y + ky) * w + (x + kx)) * 4 + c;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[ki] * kernel[kernelIndex];
          }
        }
        output[i + c] = Math.min(255, Math.max(0, sum));
      }
    }
  }
  
  return new ImageData(output, w, h);
}

// Denoise (Median Filter approximation)
function applyDenoise(imageData: ImageData, strength: number = 0.5): ImageData {
  if (strength <= 0) return imageData;
  
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = new Uint8ClampedArray(data);
  
  // Simple median-like filter (taking average of neighbors if pixel deviates too much)
  // Strength controls the threshold and blend
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        const val = data[idx + c];
        
        // Collect neighbors
        let sum = 0;
        let count = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (kx === 0 && ky === 0) continue;
            sum += data[((y + ky) * w + (x + kx)) * 4 + c];
            count++;
          }
        }
        
        const avg = sum / count;
        const diff = Math.abs(val - avg);
        
        // If noise detected (difference > threshold based on strength)
        if (diff > (1 - strength) * 30) {
           output[idx + c] = val * (1 - strength) + avg * strength;
        } else {
           output[idx + c] = val;
        }
      }
      output[idx + 3] = data[idx + 3];
    }
  }
  
  return new ImageData(output, w, h);
}

// Contrast Enhancement
function applyContrast(imageData: ImageData, amount: number = 0): ImageData {
  if (amount === 0) return imageData;
  
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);
  const factor = (259 * (amount * 255 + 255)) / (255 * (259 - amount * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    output[i] = factor * (data[i] - 128) + 128;
    output[i + 1] = factor * (data[i + 1] - 128) + 128;
    output[i + 2] = factor * (data[i + 2] - 128) + 128;
    output[i + 3] = data[i + 3];
  }
  
  return new ImageData(output, imageData.width, imageData.height);
}

// Vibrance (Boosts muted colors more than saturated ones)
function applyVibrance(imageData: ImageData, amount: number = 0): ImageData {
  if (amount === 0) return imageData;
  
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);
  const adjustment = amount * -1; // Invert for intuitive slider
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;
    const amt = ((Math.abs(max - avg) * 2) / 255) * adjustment;
    
    if (r !== max) output[i] += (max - r) * amt;
    else output[i] = r;
    
    if (g !== max) output[i + 1] += (max - g) * amt;
    else output[i + 1] = g;
    
    if (b !== max) output[i + 2] += (max - b) * amt;
    else output[i + 2] = b;
    
    output[i + 3] = data[i + 3];
  }
  
  return new ImageData(output, imageData.width, imageData.height);
}

// Advanced upscaling with multiple algorithms and custom scales
async function advancedUpscale(
  imageBitmap: ImageBitmap, 
  scale: number = 2, 
  sharpness: number = 1.0, 
  algorithm: 'bicubic' | 'lanczos' | 'unsharp' = 'unsharp',
  preProcess: any = {},
  postProcess: any = {}
): Promise<ArrayBuffer> {
  // ... existing stepwise logic skipped for brevity if scale < 3 ...
  // But to support Pre-processing correctly, we need to apply it BEFORE any scaling.
  
  // Create base canvas
  const canvas = new OffscreenCanvas(imageBitmap.width * scale, imageBitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // PRE-PROCESSING
  // Draw original to temp canvas to apply pre-filters
  const preCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const preCtx = preCanvas.getContext('2d');
  if (!preCtx) throw new Error('Could not get pre-canvas context');
  
  preCtx.drawImage(imageBitmap, 0, 0);
  let preData = preCtx.getImageData(0, 0, preCanvas.width, preCanvas.height);
  
  if (preProcess.denoise) {
     preData = applyDenoise(preData, preProcess.denoiseStrength || 0.3);
  }
  
  preCtx.putImageData(preData, 0, 0);
  
  // UPSCALING
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw pre-processed image scaled
  ctx.drawImage(preCanvas, 0, 0, canvas.width, canvas.height);
  
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let enhanced: ImageData = imageData;
  
  // ALGORITHM / SHARPENING
  switch (algorithm) {
    case 'unsharp':
      enhanced = applyUnsharpMask(imageData, sharpness * 0.8, 1.2, 2);
      break;
    case 'lanczos':
      enhanced = applySharpenFilter(imageData, sharpness, 'strong');
      break;
    default: // bicubic
      enhanced = applySharpenFilter(imageData, sharpness, 'standard');
  }
  
  // POST-PROCESSING
  if (postProcess.contrast) {
     enhanced = applyContrast(enhanced, postProcess.contrastAmount || 0.1);
  }
  if (postProcess.vibrance) {
     enhanced = applyVibrance(enhanced, postProcess.vibranceAmount || 0.2);
  }
  
  ctx.putImageData(enhanced, 0, 0);
  
  const blob = await canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
  return await blob.arrayBuffer();
}

// Apply advanced sharpness only (no scaling)
async function applyAdvancedSharpness(imageBitmap: ImageBitmap, sharpness: number = 1.0, algorithm: 'bicubic' | 'lanczos' | 'unsharp' = 'unsharp'): Promise<ArrayBuffer> {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageBitmap, 0, 0);
  
  // Apply selected sharpening algorithm
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let enhanced: ImageData;
  
  switch (algorithm) {
    case 'unsharp':
      // Professional Unsharp Mask
      enhanced = applyUnsharpMask(imageData, sharpness * 1.2, 1.0, 1);
      break;
    case 'lanczos':
      // Strong sharpening (Lanczos-like)
      enhanced = applySharpenFilter(imageData, sharpness, 'strong');
      break;
    default: // bicubic
      enhanced = applySharpenFilter(imageData, sharpness, 'standard');
  }
  
  ctx.putImageData(enhanced, 0, 0);
  
  const blob = await canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
  return await blob.arrayBuffer();
}


const ctx: Worker = self as any;

ctx.onerror = (err) => {
    console.error("Worker Global Error:", err);
};

ctx.onmessage = async (e: MessageEvent) => {
  const { type, payload, jobId } = e.data;

  try {
    if (type === 'PROCESS_IMAGE') {
      ctx.postMessage({ type: 'PROGRESS', jobId, progress: 5 });

      const { file, options } = payload;
      // file is ArrayBuffer
      
      const blob = new Blob([file]);
      let imageBitmap: ImageBitmap | null = null;
      
      try {
        imageBitmap = await createImageBitmap(blob);
        ctx.postMessage({ type: 'PROGRESS', jobId, progress: 15 });

        // Check image dimensions to prevent memory issues
        const maxDimension = 4096;
        if (imageBitmap.width > maxDimension || imageBitmap.height > maxDimension) {
          throw new Error(`Image too large. Maximum dimension is ${maxDimension}px.`);
        }

        const sharpnessLevel = options.sharpness || 1.0;
        const scale = options.scale || 2;
        const algorithm = options.algorithm || 'unsharp';
        const preProcess = options.preProcess || {};
        const postProcess = options.postProcess || {};
        
        if (options.mode === 'upscale') {
          ctx.postMessage({ type: 'PROGRESS', jobId, progress: 30 });
          
          // Use advanced upscaling with custom scale and algorithm
          const processedBuffer = await advancedUpscale(imageBitmap, scale, sharpnessLevel, algorithm, preProcess, postProcess);
          
          ctx.postMessage({ type: 'PROGRESS', jobId, progress: 90 });
          
          // Clean up
          imageBitmap.close();
          
          // @ts-ignore - TS might complain about transferables in some envs
          ctx.postMessage({ type: 'COMPLETE', jobId, result: processedBuffer }, [processedBuffer]);
        } else {
          // Restore Mode: Use advanced sharpening only
          ctx.postMessage({ type: 'PROGRESS', jobId, progress: 50 });
          const processedBuffer = await applyAdvancedSharpness(imageBitmap, sharpnessLevel, algorithm);
          
          ctx.postMessage({ type: 'PROGRESS', jobId, progress: 90 });
          
          // Clean up
          imageBitmap.close();
          
          // @ts-ignore
          ctx.postMessage({ type: 'COMPLETE', jobId, result: processedBuffer }, [processedBuffer]);
        }
      } finally {
        // Ensure cleanup even if error occurs
        if (imageBitmap) {
          imageBitmap.close();
        }
      }
    }
  } catch (error: any) {
    console.error("Worker logic error:", error);
    // Send specific properties because Error objects don't clone well
    ctx.postMessage({ 
      type: 'ERROR', 
      jobId, 
      error: error.message ? error.message : String(error) 
    });
  }
};

export {};
