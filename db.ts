
export const db = {
  name: 'KazNPUDigitalDB',
  store: 'files',
  version: 1,

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.store)) {
          request.result.createObjectStore(this.store);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async set(key: string, value: string): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(this.store, 'readwrite');
      transaction.objectStore(this.store).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async get(key: string): Promise<string | undefined> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(this.store, 'readonly');
      const request = transaction.objectStore(this.store).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(key: string): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(this.store, 'readwrite');
      transaction.objectStore(this.store).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};
