// IndexedDB wrapper class
class QuotebookDB {
    constructor() {
        this.dbName = 'QuotebookDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains('quotes')) {
                    const quotesStore = db.createObjectStore('quotes', { keyPath: 'id', autoIncrement: true });
                    quotesStore.createIndex('category', 'category', { unique: false });
                    quotesStore.createIndex('subcategory', 'subcategory', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async getSettings(key, defaultValue = null) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async setSettings(key, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllQuotes() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quotes'], 'readonly');
            const store = transaction.objectStore('quotes');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async saveAllQuotes(quotes) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quotes'], 'readwrite');
            const store = transaction.objectStore('quotes');
            
            // Clear existing quotes
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                // Add all quotes
                let pending = quotes.length;
                if (pending === 0) {
                    resolve();
                    return;
                }

                quotes.forEach(quote => {
                    const addRequest = store.add(quote);
                    addRequest.onsuccess = () => {
                        pending--;
                        if (pending === 0) {
                            resolve();
                        }
                    };
                    addRequest.onerror = () => {
                        reject(addRequest.error);
                    };
                });
            };

            clearRequest.onerror = () => {
                reject(clearRequest.error);
            };
        });
    }

    async addQuote(quote) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quotes'], 'readwrite');
            const store = transaction.objectStore('quotes');
            const request = store.add(quote);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async clearQuotes() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quotes'], 'readwrite');
            const store = transaction.objectStore('quotes');
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}