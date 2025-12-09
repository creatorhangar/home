
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data URL prefix e.g. "data:image/png;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

type ToastType = 'success' | 'error' | 'info';
type ToastListener = (key: string, type: ToastType, params?: Record<string, any>) => void;

class ToastEventManager {
  private listeners = new Set<ToastListener>();

  subscribe(callback: ToastListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(key: string, type: ToastType = 'info', params?: Record<string, any>): void {
    for (const listener of this.listeners) {
      listener(key, type, params);
    }
  }
}

export const toastEventManager = new ToastEventManager();
