// Sistema de cache de sessão local otimizado
// Mantém dados em memória durante a sessão para acesso ultra-rápido

interface SessionCacheData {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number // Time to live em ms
  }
}

class SessionCache {
  private cache: SessionCacheData = {}
  private maxSize = 50 // Máximo de 50 itens no cache
  private listeners: Set<(key: string, data: any) => void> = new Set()

  // Armazenar dados no cache
  set(key: string, data: any, ttl: number = 30 * 60 * 1000): void {
    // Limpar cache se estiver muito grande
    if (Object.keys(this.cache).length >= this.maxSize) {
      this.cleanup()
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    }

    // Notificar listeners
    this.notifyListeners(key, data)
  }

  // Recuperar dados do cache
  get(key: string): any | null {
    const item = this.cache[key]
    
    if (!item) {
      return null
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      delete this.cache[key]
      return null
    }

    return item.data
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const item = this.cache[key]
    
    if (!item) {
      return false
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      delete this.cache[key]
      return false
    }

    return true
  }

  // Remover item do cache
  delete(key: string): void {
    delete this.cache[key]
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    Object.entries(this.cache).forEach(([key, item]) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      delete this.cache[key]
    })

    console.log(`🧹 Cache de sessão limpo: ${keysToDelete.length} itens removidos`)
  }

  // Limpar todo o cache
  clear(): void {
    this.cache = {}
    console.log('🗑️ Cache de sessão completamente limpo')
  }

  // Obter estatísticas do cache
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    oldestItem: number
    newestItem: number
  } {
    const items = Object.values(this.cache)
    const timestamps = items.map(item => item.timestamp)
    
    return {
      size: items.length,
      maxSize: this.maxSize,
      hitRate: 0, // Seria calculado com métricas de hit/miss
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0
    }
  }

  // Adicionar listener para mudanças no cache
  addListener(callback: (key: string, data: any) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notificar listeners
  private notifyListeners(key: string, data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(key, data)
      } catch (error) {
        console.error('Erro ao notificar listener do cache de sessão:', error)
      }
    })
  }

  // Obter todas as chaves do cache
  keys(): string[] {
    return Object.keys(this.cache)
  }

  // Obter tamanho atual do cache
  size(): number {
    return Object.keys(this.cache).length
  }
}

// Singleton para o cache de sessão
let sessionCache: SessionCache | null = null

export function getSessionCache(): SessionCache {
  if (!sessionCache) {
    sessionCache = new SessionCache()
    
    // Limpar cache expirado a cada 5 minutos
    setInterval(() => {
      sessionCache?.cleanup()
    }, 5 * 60 * 1000)
  }
  return sessionCache
}

export function destroySessionCache(): void {
  if (sessionCache) {
    sessionCache.clear()
    sessionCache = null
  }
}

// Hook para usar o cache de sessão
export function useSessionCache() {
  const cache = getSessionCache()
  
  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    getStats: cache.getStats.bind(cache),
    addListener: cache.addListener.bind(cache),
    keys: cache.keys.bind(cache),
    size: cache.size.bind(cache)
  }
}

// Utilitários para cache de sessão
export const sessionCacheUtils = {
  // Gerar chave de cache baseada em parâmetros
  generateKey: (prefix: string, params: Record<string, any> = {}): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix
  },

  // Cache com invalidação automática
  withInvalidation: <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30 * 60 * 1000
  ): Promise<T> => {
    const cache = getSessionCache()
    
    // Verificar se existe no cache
    const cached = cache.get(key)
    if (cached) {
      return Promise.resolve(cached)
    }

    // Buscar dados e armazenar no cache
    return fetcher().then(data => {
      cache.set(key, data, ttl)
      return data
    })
  },

  // Cache com refresh em background
  withBackgroundRefresh: <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30 * 60 * 1000,
    refreshThreshold: number = 0.8 // Refresh quando 80% do TTL passou
  ): Promise<T> => {
    const cache = getSessionCache()
    
    // Verificar se existe no cache
    const cached = cache.get(key)
    if (cached) {
      // Verificar se precisa de refresh em background
      const item = cache['cache'][key]
      if (item) {
        const age = Date.now() - item.timestamp
        const ageRatio = age / item.ttl
        
        if (ageRatio > refreshThreshold) {
          // Refresh em background sem bloquear
          fetcher().then(data => {
            cache.set(key, data, ttl)
          }).catch(error => {
            console.warn('Erro no refresh em background:', error)
          })
        }
      }
      
      return Promise.resolve(cached)
    }

    // Buscar dados e armazenar no cache
    return fetcher().then(data => {
      cache.set(key, data, ttl)
      return data
    })
  }
}
