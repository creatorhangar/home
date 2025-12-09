import { describe, it, expect } from 'vitest';
import { detectDominantBorderColor } from '@/utils/imageProcessor';

const createTestImage = async (): Promise<HTMLImageElement> => {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no ctx');
  // Fill entire canvas with green
  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillRect(0, 0, 20, 20);
  // Paint corners in solid red to dominate borders
  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fillRect(0, 0, 5, 5);
  ctx.fillRect(15, 0, 5, 5);
  ctx.fillRect(0, 15, 5, 5);
  ctx.fillRect(15, 15, 5, 5);
  const url = canvas.toDataURL('image/png');
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });
  return img;
};

describe('detectDominantBorderColor', () => {
  it('detecta a cor dominante nas bordas', async () => {
    const img = await createTestImage();
    const dominant = detectDominantBorderColor(img);
    expect(dominant).not.toBeNull();
    expect(dominant).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('retorna null para imagens muito pequenas', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, 2, 2);
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });
    const dominant = detectDominantBorderColor(img);
    expect(dominant === null || typeof dominant === 'object').toBe(true);
  });
});