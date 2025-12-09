import { fileToBase64, toastEventManager } from '@/utils/fileUtils';

describe('fileUtils', () => {
  it('converte File para base64', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const file = new File([blob], 'sample.txt', { type: 'text/plain' });
    const base64 = await fileToBase64(file);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
  });

  it('emite toasts para inscritos', () => {
    const calls: Array<{ key: string; type: string; params?: Record<string, any> }> = [];
    const unsub = toastEventManager.subscribe((key, type, params) => {
      calls.push({ key, type, params });
    });
    toastEventManager.emit('toasts.imagesReady', 'success', { count: 2 });
    unsub();
    expect(calls[0]).toEqual({ key: 'toasts.imagesReady', type: 'success', params: { count: 2 } });
  });
});