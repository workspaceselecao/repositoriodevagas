// Cache Simples para Desenvolvimento
// Versão minimalista que funciona apenas em memória para evitar problemas

interface SimpleCacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, SimpleCacheEntry<any>>()
  private maxSize = 100

  // Armazenar dados
  set<T>(key: string, data: T, ttl: number = 15 * 60 * 1000): void {
    // Limitar tamanho do cache
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    console.log(`💾 Dados armazenados no cache simples: ${key}`)
  }

  // Recuperar dados
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Verificar se existe
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Remover entrada
  delete(key: string): void {
    this.cache.delete(key)
  }

  // Limpar cache
  clear(): void {
    this.cache.clear()
    console.log('🗑️ Cache simples limpo')
  }

  // Remover entrada mais antiga
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Obter estatísticas
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// Singleton
let simpleCache: SimpleCache | null = null

export function getSimpleCache(): SimpleCache {
  if (!simpleCache) {
    simpleCache = new SimpleCache()
  }
  return simpleCache
}

// Hook para usar cache simples
export function useSimpleCache() {
  const cache = getSimpleCache()
  
  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    getStats: cache.getStats.bind(cache)
  }
}
