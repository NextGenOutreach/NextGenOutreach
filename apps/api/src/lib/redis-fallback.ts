// Redis fallback for shared hosting environments
class MemoryStore {
  private store = new Map<string, any>();
  private ttl = new Map<string, NodeJS.Timeout>();

  async set(key: string, value: any, ttlSeconds?: number) {
    this.store.set(key, JSON.stringify(value));
    
    if (ttlSeconds) {
      const existingTtl = this.ttl.get(key);
      if (existingTtl) clearTimeout(existingTtl);
      
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.ttl.delete(key);
      }, ttlSeconds * 1000);
      
      this.ttl.set(key, timeout);
    }
  }

  async get(key: string) {
    const value = this.store.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string) {
    this.store.delete(key);
    const ttl = this.ttl.get(key);
    if (ttl) {
      clearTimeout(ttl);
      this.ttl.delete(key);
    }
  }

  async exists(key: string) {
    return this.store.has(key);
  }
}

export const redis = new MemoryStore();
