// Sistema de Cache Persistente com IndexedDB
// Mantém dados entre sessões para acesso instantâneo ao retornar à aplicação

interface PersistentCacheEntry<T> {
  id: string
  data: T
  metadata: {
    timestamp: number
    ttl: number
    version: number
    userId?: string
    lastAccess: number
    accessCount: number
    size: number
  }
}

interface CacheMetrics {
  totalEntries: number
  totalSize: number
  averageAccessCount: number
  oldestEntry: number
  newestEntry: number
}

class PersistentCache {
  private db: IDBDatabase | null = null
  private dbName = 'RepositorioVagasPersistentCache'
  private version = 2
  private maxTotalSize = 50 * 1024 * 1024 // 50MB máximo
  private maxEntryAge = 7 * 24 * 60 * 60 * 1000 // 7 dias máximo

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('⚠️ IndexedDB não disponível no servidor')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ Cache persistente inicializado')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Criar stores para diferentes tipos de dados
        const stores = [
          'vagas',
          'clientes', 
          'sites',
          'categorias',
          'cargos',
          'celulas',
          'usuarios',
          'noticias',
          'dashboard_stats',
          'search_history',
          'user_preferences'
        ]

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' })
            
            // Índices para consultas eficientes
            store.createIndex('timestamp', 'metadata.timestamp')
            store.createIndex('userId', 'metadata.userId')
            store.createIndex('lastAccess', 'metadata.lastAccess')
            store.createIndex('accessCount', 'metadata.accessCount')
            store.createIndex('size', 'metadata.size')
          }
        })

        console.log('🔄 IndexedDB atualizado para versão', this.version)
      }
    })
  }

  // Armazenar dados no cache persistente
  async set<T>(
    storeName: string,
    key: string,
    data: T,
    options: {
      ttl?: number
      userId?: string
      priority?: 'low' | 'medium' | 'high'
    } = {}
  ): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ Cache persistente não inicializado')
      return
    }

    const serializedData = JSON.stringify(data)
    const size = new Blob([serializedData]).size
    
    // Verificar se excede limite de tamanho por entrada
    if (size > 5 * 1024 * 1024) { // 5MB por entrada
      console.warn(`⚠️ Entrada muito grande (${size} bytes): ${key}`)
      return
    }

    const entry: PersistentCacheEntry<T> = {
      id: key,
      data,
      metadata: {
        timestamp: Date.now(),
        ttl: options.ttl || 24 * 60 * 60 * 1000, // 24h padrão
        version: 1,
        userId: options.userId,
        lastAccess: Date.now(),
        accessCount: 1,
        size
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Verificar tamanho total antes de adicionar
      this.getTotalSize().then(totalSize => {
        if (totalSize + size > this.maxTotalSize) {
          // Limpar cache para fazer espaço
          this.evictOldEntries(storeName, size).then(() => {
            this.putEntry(store, entry, resolve, reject)
          })
        } else {
          this.putEntry(store, entry, resolve, reject)
        }
      })
    })
  }

  private putEntry<T>(
    store: IDBObjectStore,
    entry: PersistentCacheEntry<T>,
    resolve: () => void,
    reject: (error: any) => void
  ): void {
    const request = store.put(entry)
    
    request.onsuccess = () => {
      console.log(`💾 Dados armazenados no cache persistente: ${entry.id}`)
      resolve()
    }
    
    request.onerror = () => {
      console.error(`❌ Erro ao armazenar no cache persistente: ${entry.id}`, request.error)
      reject(request.error)
    }
  }

  // Recuperar dados do cache persistente
  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const entry: PersistentCacheEntry<T> = request.result
        
        if (!entry) {
          resolve(null)
          return
        }

        // Verificar se expirou
        if (this.isExpired(entry)) {
          store.delete(key)
          console.log(`🗑️ Entrada expirada removida: ${key}`)
          resolve(null)
          return
        }

        // Atualizar estatísticas de acesso
        entry.metadata.lastAccess = Date.now()
        entry.metadata.accessCount++
        
        const updateRequest = store.put(entry)
        updateRequest.onsuccess = () => {
          console.log(`📖 Dados recuperados do cache persistente: ${key}`)
          resolve(entry.data)
        }
      }

      request.onerror = () => {
        console.error(`❌ Erro ao recuperar do cache persistente: ${key}`, request.error)
        resolve(null)
      }
    })
  }

  // Verificar se entrada existe e não expirou
  async has(storeName: string, key: string): Promise<boolean> {
    const data = await this.get(storeName, key)
    return data !== null
  }

  // Remover entrada específica
  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        console.log(`🗑️ Entrada removida do cache persistente: ${key}`)
        resolve()
      }

      request.onerror = () => {
        console.error(`❌ Erro ao remover do cache persistente: ${key}`, request.error)
        reject(request.error)
      }
    })
  }

  // Limpar store específico
  async clearStore(storeName: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        console.log(`🗑️ Store limpo: ${storeName}`)
        resolve()
      }

      request.onerror = () => {
        console.error(`❌ Erro ao limpar store: ${storeName}`, request.error)
        reject(request.error)
      }
    })
  }

  // Limpar cache por usuário
  async clearUserCache(userId: string): Promise<void> {
    if (!this.db) return

    const stores = Array.from(this.db.objectStoreNames)
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const index = store.index('userId')
        const request = index.openCursor(IDBKeyRange.only(userId))

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          } else {
            resolve()
          }
        }

        request.onerror = () => reject(request.error)
      })
    }

    console.log(`🗑️ Cache do usuário limpo: ${userId}`)
  }

  // Obter métricas do cache
  async getMetrics(): Promise<CacheMetrics> {
    if (!this.db) {
      return {
        totalEntries: 0,
        totalSize: 0,
        averageAccessCount: 0,
        oldestEntry: 0,
        newestEntry: 0
      }
    }

    const stores = Array.from(this.db.objectStoreNames)
    let totalEntries = 0
    let totalSize = 0
    let totalAccessCount = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    for (const storeName of stores) {
      const metrics = await this.getStoreMetrics(storeName)
      totalEntries += metrics.entries
      totalSize += metrics.size
      totalAccessCount += metrics.accessCount
      oldestTimestamp = Math.min(oldestTimestamp, metrics.oldestTimestamp)
      newestTimestamp = Math.max(newestTimestamp, metrics.newestTimestamp)
    }

    return {
      totalEntries,
      totalSize,
      averageAccessCount: totalEntries > 0 ? totalAccessCount / totalEntries : 0,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp
    }
  }

  private async getStoreMetrics(storeName: string): Promise<{
    entries: number
    size: number
    accessCount: number
    oldestTimestamp: number
    newestTimestamp: number
  }> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result as PersistentCacheEntry<any>[]
        
        const metrics = entries.reduce((acc, entry) => {
          acc.entries++
          acc.size += entry.metadata.size
          acc.accessCount += entry.metadata.accessCount
          acc.oldestTimestamp = Math.min(acc.oldestTimestamp, entry.metadata.timestamp)
          acc.newestTimestamp = Math.max(acc.newestTimestamp, entry.metadata.timestamp)
          return acc
        }, {
          entries: 0,
          size: 0,
          accessCount: 0,
          oldestTimestamp: Date.now(),
          newestTimestamp: 0
        })

        resolve(metrics)
      }

      request.onerror = () => {
        resolve({
          entries: 0,
          size: 0,
          accessCount: 0,
          oldestTimestamp: Date.now(),
          newestTimestamp: 0
        })
      }
    })
  }

  // Limpeza de entradas antigas
  private async evictOldEntries(storeName: string, neededSpace: number): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Buscar entradas ordenadas por último acesso (LRU)
      const index = store.index('lastAccess')
      const request = index.openCursor()

      let freedSpace = 0
      const entriesToDelete: string[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        
        if (cursor && freedSpace < neededSpace) {
          const entry = cursor.value as PersistentCacheEntry<any>
          
          // Priorizar remoção de entradas antigas ou com baixo acesso
          const age = Date.now() - entry.metadata.timestamp
          const shouldEvict = 
            age > this.maxEntryAge || 
            entry.metadata.accessCount < 2 ||
            freedSpace < neededSpace

          if (shouldEvict) {
            entriesToDelete.push(entry.id)
            freedSpace += entry.metadata.size
          }
          
          cursor.continue()
        } else {
          // Remover entradas selecionadas
          entriesToDelete.forEach(id => {
            store.delete(id)
          })
          
          console.log(`🧹 Cache limpo: ${entriesToDelete.length} entradas removidas, ${freedSpace} bytes liberados`)
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  // Verificar se entrada expirou
  private isExpired(entry: PersistentCacheEntry<any>): boolean {
    const now = Date.now()
    return now - entry.metadata.timestamp > entry.metadata.ttl
  }

  // Obter tamanho total do cache
  private async getTotalSize(): Promise<number> {
    const metrics = await this.getMetrics()
    return metrics.totalSize
  }

  // Limpeza periódica de entradas expiradas
  async cleanup(): Promise<void> {
    if (!this.db) return

    const stores = Array.from(this.db.objectStoreNames)
    let totalCleaned = 0

    for (const storeName of stores) {
      const cleaned = await this.cleanupStore(storeName)
      totalCleaned += cleaned
    }

    if (totalCleaned > 0) {
      console.log(`🧹 Limpeza periódica: ${totalCleaned} entradas expiradas removidas`)
    }
  }

  private async cleanupStore(storeName: string): Promise<number> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result as PersistentCacheEntry<any>[]
        let cleaned = 0

        entries.forEach(entry => {
          if (this.isExpired(entry)) {
            store.delete(entry.id)
            cleaned++
          }
        })

        resolve(cleaned)
      }

      request.onerror = () => resolve(0)
    })
  }

  // Exportar cache para backup
  async exportCache(): Promise<Blob> {
    if (!this.db) throw new Error('Cache não inicializado')

    const exportData: any = {}
    const stores = Array.from(this.db.objectStoreNames)

    for (const storeName of stores) {
      const data = await new Promise<any[]>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      exportData[storeName] = data
    }

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
  }

  // Importar cache de backup
  async importCache(blob: Blob): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')

    const text = await blob.text()
    const importData = JSON.parse(text)

    for (const [storeName, entries] of Object.entries(importData)) {
      if (this.db.objectStoreNames.contains(storeName)) {
        const transaction = this.db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        
        for (const entry of entries as PersistentCacheEntry<any>[]) {
          store.put(entry)
        }
      }
    }

    console.log('✅ Cache importado com sucesso')
  }

  // Fechar conexão
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('🔒 Cache persistente fechado')
    }
  }
}

// Singleton
let persistentCache: PersistentCache | null = null

export function getPersistentCache(): PersistentCache {
  if (!persistentCache) {
    persistentCache = new PersistentCache()
    persistentCache.initialize().catch(error => {
      console.error('❌ Erro ao inicializar cache persistente:', error)
    })
  }
  return persistentCache
}

// Hook para usar o cache persistente
export function usePersistentCache() {
  const cache = getPersistentCache()
  
  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    clearStore: cache.clearStore.bind(cache),
    clearUserCache: cache.clearUserCache.bind(cache),
    getMetrics: cache.getMetrics.bind(cache),
    cleanup: cache.cleanup.bind(cache),
    exportCache: cache.exportCache.bind(cache),
    importCache: cache.importCache.bind(cache),
    close: cache.close.bind(cache)
  }
}
