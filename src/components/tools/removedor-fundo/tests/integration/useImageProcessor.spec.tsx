import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import * as idb from '@/utils/idb';

vi.spyOn(idb, 'getImages').mockResolvedValue([]);
vi.spyOn(idb, 'saveImage').mockResolvedValue(undefined);
vi.spyOn(idb, 'clearImages').mockResolvedValue(undefined);

describe('useImageProcessor', () => {
  it('adiciona imagens válidas e ignora inválidas', () => {
    // @ts-ignore
    URL.revokeObjectURL = vi.fn(() => {});
    const { result } = renderHook(() => useImageProcessor());
    const valid = new File([new Blob(['x'], { type: 'image/png' })], 'v.png', { type: 'image/png' });
    const invalid = new File([new Blob(['x'], { type: 'application/pdf' })], 'i.pdf', { type: 'application/pdf' });
    const files = {
      0: valid,
      1: invalid,
      length: 2,
      item: (i: number) => (i === 0 ? valid : invalid),
    } as unknown as FileList;
    let hadInvalid = false;
    act(() => {
      hadInvalid = result.current.addImages(files);
    });
    expect(hadInvalid).toBe(true);
    expect(result.current.images.length).toBe(1);
  });
});