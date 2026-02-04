
import { GeneratedAsset, ProjectVersion } from '../types';

const DB_NAME = 'StudioGenDB';
const DB_VERSION = 1;
const ASSETS_STORE = 'assets';
const VERSIONS_STORE = 'versions';

export class StudioDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ASSETS_STORE)) {
          db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(VERSIONS_STORE)) {
          db.createObjectStore(VERSIONS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async getAllAssets(): Promise<GeneratedAsset[]> {
    return this.getAll<GeneratedAsset>(ASSETS_STORE);
  }

  async saveAsset(asset: GeneratedAsset): Promise<void> {
    return this.put(ASSETS_STORE, asset);
  }

  async deleteAsset(id: string): Promise<void> {
    return this.delete(ASSETS_STORE, id);
  }

  async clearAllAssets(): Promise<void> {
    return this.clear(ASSETS_STORE);
  }

  async getAllVersions(): Promise<ProjectVersion[]> {
    return this.getAll<ProjectVersion>(VERSIONS_STORE);
  }

  async saveVersion(version: ProjectVersion): Promise<void> {
    return this.put(VERSIONS_STORE, version);
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(storeName: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new StudioDB();
