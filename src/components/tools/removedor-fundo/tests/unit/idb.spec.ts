import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { clearImages, getImages, saveImage } from '@/utils/idb';
import { ImageStatus } from '@/types';

// polyfill IndexedDB
import 'fake-indexeddb/auto';

describe('IndexedDB utils', () => {
  beforeAll(async () => {
    await clearImages();
  });

  afterEach(async () => {
    await clearImages();
  });

  it('salva e lista imagens', async () => {
    const file = new File([new Blob(['x'], { type: 'image/png' })], 'a.png', { type: 'image/png' });
    await saveImage({ id: '1', file, processedURL: null, status: ImageStatus.Pending, error: null });
    const items = await getImages();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe('1');
    expect(items[0].status).toBe(ImageStatus.Pending);
  });

  it('limpa imagens', async () => {
    const file = new File([new Blob(['x'], { type: 'image/png' })], 'b.png', { type: 'image/png' });
    await saveImage({ id: '2', file, processedURL: null, status: ImageStatus.Pending, error: null });
    await clearImages();
    const items = await getImages();
    expect(items.length).toBe(0);
  });
});