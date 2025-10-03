// Sistema de Cache Inteligente Multi-Camada
// Combina cache em memória, localStorage e IndexedDB para máxima eficiência

import { Vaga, User } from '../types/database'
import { sessionCache } from './session-cache'

// Tipos para o sistema de cache
interface CacheMetadata {
  timestamp: number
  ttl: number
  version: number
  lastDbUpdate?: number
  userId?: string
  permissions?: string[]
}

interface CacheEntry<T> {
  data: T
  metadata: CacheMetadata
}

interface CacheStats {
  hits: number
  misses: number
  invalidations: number
  size: number
  lastCleanup: number
}

// Configurações de cache por tipo de dados
const CACHE_CONFIG = {
  vagas: {
    ttl: 15 * 60 * 1000, // 15 minutos
    maxSize: 1000,
    priority: 'high',
    persist: true
  },
  clientes: {
    ttl: 30 * 60 * 1000, // 30 minutos
    maxSize: 100,
    priority: 'medium',
    persist: true
  },
  sites: {
    ttl: 30 * 60 * 1000, // 30 minutos
    maxSize: 100,
    priority: 'medium',
    persist: true
  },
  categorias: {
    ttl: 60 * 60 * 1000, // 1 hora
    maxSize: 50,
    priority: 'low',
    persist: true
  },
  cargos: {
    ttl: 60 * 60 * 1000, // 1 hora
    maxSize: 200,
    priority: 'medium',
    persist: true
  },
  usuarios: {
    ttl: 10 * 60 * 1000, // 10 minutos
    maxSize: 50,
    priority: 'high',
    persist: false // Dados sensíveis não persistem
  },
  noticias: {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 50,
    priority: 'high',
    persist: false
  }
} as const

type CacheKey = keyof typeof CACHE_CONFIG

class IntelligentCache {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    size: 0,
    lastCleanup: Date.now()
  }
  private sessionCache = sessionCache
  private indexedDB: IDBDatabase | null = null
  private isOnline = navigator.onLine
  private currentUser: User | null = null
  private listeners = new Map<string, Set<(data: any) => void>>()

  constructor() {
    this.initializeIndexedDB()
    this.setupOnlineStatusListener()
    this.setupPeriodicCleanup()
    this.setupBackgroundRefresh()
  }

  // Inicializar IndexedDB para cache persistente
  private async initializeIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const request = indexedDB.open('RepositorioVagasCache', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Criar stores para cada tipo de cache
        Object.keys(CACHE_CONFIG).forEach(key => {
          if (!db.objectStoreNames.contains(key)) {
            const store = db.createObjectStore(key, { keyPath: 'id' })
            store.createIndex('timestamp', 'metadata.timestamp')
            store.createIndex('userId', 'metadata.userId')
          }
        })
      }

      request.onsuccess = () => {
        this.indexedDB = request.result
        console.log('✅ IndexedDB inicializado para cache persistente')
      }

      request.onerror = () => {
        console.warn('⚠️ Falha ao inicializar IndexedDB, usando apenas cache em memória')
      }
    } catch (error) {
      console.warn('⚠️ IndexedDB não suportado, usando apenas cache em memória')
    }
  }

  // Configurar listener de status online
  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🌐 Conexão restaurada - verificando cache')
      this.validateCacheOnReconnect()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📴 Modo offline - usando cache local')
    })
  }

  // Configurar limpeza periódica
  private setupPeriodicCleanup(): void {
    // Limpeza a cada 5 minutos
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  // Configurar refresh em background
  private setupBackgroundRefresh(): void {
    // Refresh em background a cada 10 minutos
    setInterval(() => {
      this.backgroundRefresh()
    }, 10 * 60 * 1000)
  }

  // Definir usuário atual para cache seletivo
  setCurrentUser(user: User | null): void {
    this.currentUser = user
    if (!user) {
      this.clearUserSpecificCache()
    }
  }

  // Obter dados com cache inteligente
  async get<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    options: {
      forceRefresh?: boolean
      userId?: string
      skipCache?: boolean
    } = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(key, options.userId)
    
    // Se forçar refresh ou pular cache, buscar diretamente
    if (options.forceRefresh || options.skipCache) {
      return this.fetchAndCache(key, fetcher, cacheKey)
    }

    // 1. Tentar cache em memória primeiro (mais rápido)
    const memoryData = this.getFromMemory<T>(cacheKey)
    if (memoryData) {
      this.stats.hits++
      return memoryData
    }

    // 2. Tentar cache de sessão
    const sessionData = this.getFromSession<T>(cacheKey)
    if (sessionData) {
      this.stats.hits++
      // Promover para cache em memória
      this.setToMemory(cacheKey, sessionData, CACHE_CONFIG[key].ttl)
      return sessionData
    }

    // 3. Tentar IndexedDB (se disponível e persistir)
    if (CACHE_CONFIG[key].persist && this.indexedDB) {
      const persistedData = await this.getFromIndexedDB<T>(key, cacheKey)
      if (persistedData) {
        this.stats.hits++
        // Promover para cache em memória e sessão
        this.setToMemory(cacheKey, persistedData, CACHE_CONFIG[key].ttl)
        this.setToSession(cacheKey, persistedData, CACHE_CONFIG[key].ttl)
        return persistedData
      }
    }

    // 4. Cache miss - buscar dados
    this.stats.misses++
    
    // Se offline, retornar dados em cache mesmo que expirados
    if (!this.isOnline) {
      const staleData = await this.getStaleData<T>(key, cacheKey)
      if (staleData) {
        console.log(`📴 Usando dados em cache (offline): ${key}`)
        return staleData
      }
    }

    return this.fetchAndCache(key, fetcher, cacheKey)
  }

  // Buscar e armazenar no cache
  private async fetchAndCache<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    cacheKey: string
  ): Promise<T> {
    try {
      console.log(`🔄 Buscando dados do servidor: ${key}`)
      const data = await fetcher()
      
      // Armazenar em todas as camadas
      this.setToMemory(cacheKey, data, CACHE_CONFIG[key].ttl)
      this.setToSession(cacheKey, data, CACHE_CONFIG[key].ttl)
      
      if (CACHE_CONFIG[key].persist && this.indexedDB) {
        await this.setToIndexedDB(key, cacheKey, data, CACHE_CONFIG[key].ttl)
      }

      // Notificar listeners
      this.notifyListeners(key, data)

      console.log(`✅ Dados armazenados no cache: ${key}`)
      return data
    } catch (error) {
      console.error(`❌ Erro ao buscar dados: ${key}`, error)
      
      // Tentar dados em cache mesmo que expirados
      const staleData = await this.getStaleData<T>(key, cacheKey)
      if (staleData) {
        console.log(`🔄 Usando dados em cache (erro na busca): ${key}`)
        return staleData
      }
      
      throw error
    }
  }

  // Cache em memória
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    if (this.isExpired(entry.metadata)) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data
  }

  private setToMemory<T>(key: string, data: T, ttl: number): void {
    // Limitar tamanho do cache em memória
    if (this.memoryCache.size >= 100) {
      this.evictOldestMemoryEntry()
    }

    this.memoryCache.set(key, {
      data,
      metadata: {
        timestamp: Date.now(),
        ttl,
        version: 1,
        userId: this.currentUser?.id
      }
    })
  }

  // Cache de sessão
  private getFromSession<T>(key: string): T | null {
    return this.sessionCache.get(key)
  }

  private setToSession<T>(key: string, data: T, ttl: number): void {
    this.sessionCache.set(key, data, ttl)
  }

  // Cache persistente (IndexedDB)
  private async getFromIndexedDB<T>(storeKey: CacheKey, cacheKey: string): Promise<T | null> {
    if (!this.indexedDB) return null

    return new Promise((resolve) => {
      const transaction = this.indexedDB!.transaction([storeKey], 'readonly')
      const store = transaction.objectStore(storeKey)
      const request = store.get(cacheKey)

      request.onsuccess = () => {
        const entry = request.result
        if (!entry || this.isExpired(entry.metadata)) {
          resolve(null)
          return
        }
        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  private async setToIndexedDB<T>(
    storeKey: CacheKey,
    cacheKey: string,
    data: T,
    ttl: number
  ): Promise<void> {
    if (!this.indexedDB) return

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([storeKey], 'readwrite')
      const store = transaction.objectStore(storeKey)
      
      const entry = {
        id: cacheKey,
        data,
        metadata: {
          timestamp: Date.now(),
          ttl,
          version: 1,
          userId: this.currentUser?.id
        }
      }

      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Obter dados em cache mesmo que expirados
  private async getStaleData<T>(key: CacheKey, cacheKey: string): Promise<T | null> {
    // Tentar memória
    const memoryEntry = this.memoryCache.get(cacheKey)
    if (memoryEntry) return memoryEntry.data

    // Tentar sessão
    const sessionData = this.sessionCache.get(cacheKey)
    if (sessionData) return sessionData

    // Tentar IndexedDB
    if (CACHE_CONFIG[key].persist && this.indexedDB) {
      return new Promise((resolve) => {
        const transaction = this.indexedDB!.transaction([key], 'readonly')
        const store = transaction.objectStore(key)
        const request = store.get(cacheKey)

        request.onsuccess = () => {
          resolve(request.result?.data || null)
        }
        request.onerror = () => resolve(null)
      })
    }

    return null
  }

  // Gerar chave de cache
  private generateCacheKey(key: CacheKey, userId?: string): string {
    const user = userId || this.currentUser?.id || 'anonymous'
    return `${key}:${user}`
  }

  // Verificar se entrada expirou
  private isExpired(metadata: CacheMetadata): boolean {
    return Date.now() - metadata.timestamp > metadata.ttl
  }

  // Invalidar cache específico
  invalidate(key: CacheKey, userId?: string): void {
    const cacheKey = this.generateCacheKey(key, userId)
    
    this.memoryCache.delete(cacheKey)
    this.sessionCache.delete(cacheKey)
    
    if (CACHE_CONFIG[key].persist && this.indexedDB) {
      const transaction = this.indexedDB.transaction([key], 'readwrite')
      const store = transaction.objectStore(key)
      store.delete(cacheKey)
    }

    this.stats.invalidations++
    console.log(`🗑️ Cache invalidado: ${key}`)
  }

  // Invalidar cache do usuário
  invalidateUserCache(userId: string): void {
    Object.keys(CACHE_CONFIG).forEach(key => {
      this.invalidate(key as CacheKey, userId)
    })
  }

  // Limpar cache específico do usuário
  private clearUserSpecificCache(): void {
    if (!this.currentUser) return

    const userKeys = Array.from(this.memoryCache.keys()).filter(key => 
      key.includes(this.currentUser!.id)
    )
    
    userKeys.forEach(key => {
      this.memoryCache.delete(key)
      this.sessionCache.delete(key)
    })
  }

  // Limpeza de cache expirado
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    // Limpar memória
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry.metadata)) {
        this.memoryCache.delete(key)
        cleaned++
      }
    }

    // Limpar IndexedDB
    if (this.indexedDB) {
      Object.keys(CACHE_CONFIG).forEach(async (key) => {
        const transaction = this.indexedDB!.transaction([key], 'readwrite')
        const store = transaction.objectStore(key)
        const index = store.index('timestamp')
        
        const request = index.openCursor()
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            if (now - cursor.value.metadata.timestamp > cursor.value.metadata.ttl) {
              cursor.delete()
              cleaned++
            }
            cursor.continue()
          }
        }
      })
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache limpo: ${cleaned} itens expirados removidos`)
    }

    this.stats.lastCleanup = now
  }

  // Refresh em background
  private backgroundRefresh(): void {
    if (!this.isOnline) return

    console.log('🔄 Refresh em background iniciado')
    
    // Verificar quais caches precisam de refresh
    for (const [key, entry] of this.memoryCache.entries()) {
      const config = CACHE_CONFIG[key.split(':')[0] as CacheKey]
      if (!config) continue

      const age = Date.now() - entry.metadata.timestamp
      const refreshThreshold = config.ttl * 0.8 // Refresh quando 80% do TTL passou

      if (age > refreshThreshold) {
        // Marcar para refresh em background
        console.log(`🔄 Marcando para refresh em background: ${key}`)
      }
    }
  }

  // Validar cache ao reconectar
  private validateCacheOnReconnect(): void {
    console.log('🔍 Validando cache após reconexão')
    
    // Verificar se dados em cache ainda são válidos
    // Implementar lógica de validação com servidor se necessário
  }

  // Remover entrada mais antiga da memória
  private evictOldestMemoryEntry(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.metadata.timestamp < oldestTime) {
        oldestTime = entry.metadata.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
    }
  }

  // Adicionar listener para mudanças
  addListener(key: CacheKey, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key)!.add(callback)
    
    return () => {
      this.listeners.get(key)?.delete(callback)
    }
  }

  // Notificar listeners
  private notifyListeners(key: CacheKey, data: any): void {
    this.listeners.get(key)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  // Obter estatísticas
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      size: this.memoryCache.size
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.memoryCache.clear()
    this.sessionCache.clear()
    
    if (this.indexedDB) {
      Object.keys(CACHE_CONFIG).forEach(key => {
        const transaction = this.indexedDB!.transaction([key], 'readwrite')
        const store = transaction.objectStore(key)
        store.clear()
      })
    }

    console.log('🗑️ Todo o cache foi limpo')
  }
}

// Singleton
let intelligentCache: IntelligentCache | null = null

export function getIntelligentCache(): IntelligentCache {
  if (!intelligentCache) {
    intelligentCache = new IntelligentCache()
  }
  return intelligentCache
}

// Hook para usar o cache inteligente
export function useIntelligentCache() {
  const cache = getIntelligentCache()
  
  return {
    get: cache.get.bind(cache),
    invalidate: cache.invalidate.bind(cache),
    invalidateUserCache: cache.invalidateUserCache.bind(cache),
    setCurrentUser: cache.setCurrentUser.bind(cache),
    addListener: cache.addListener.bind(cache),
    getStats: cache.getStats.bind(cache),
    clear: cache.clear.bind(cache)
  }
}
