
import { ImageFile, ImageStatus } from '../types';

const DB_NAME = 'ips-image-store';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Interface para o objeto que será efetivamente armazenado no IndexedDB.
// A `originalURL` é omitida pois é um Object URL temporário.
interface StoredImage {
  id: string;
  file: File;
  processedURL: string | null;
  status: ImageStatus;
  error: string | null;
  removalInfo?: ImageFile['removalInfo'];
}

let db: IDBDatabase;

/**
 * Inicializa e abre a conexão com o banco de dados IndexedDB.
 * Se a conexão já existir, a retorna.
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening DB');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    // Chamado se a versão do banco de dados mudar, ou na primeira criação.
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Salva ou atualiza uma imagem no IndexedDB.
 * @param image - O objeto de imagem a ser salvo.
 */
export const saveImage = async (image: StoredImage): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(image);

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error saving image:', request.error);
        reject(request.error)
    };
  });
};

/**
 * Obtém todas as imagens salvas do IndexedDB.
 * @returns Uma promessa que resolve com um array de objetos StoredImage.
 */
export const getImages = async (): Promise<StoredImage[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
        console.error('Error getting images:', request.error);
        reject(request.error);
    };
  });
};


/**
 * Limpa todos os registros do object store de imagens.
 */
export const clearImages = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error clearing images:', request.error);
        reject(request.error);
    };
  });
};
