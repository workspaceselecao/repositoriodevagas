// Sistema Unificado de Cache - Orquestra todos os sistemas de cache
// Combina cache inteligente, persistente, reativo, paginação, permissões e background sync

import { getIntelligentCache } from './intelligent-cache'
import { getPersistentCache } from './persistent-cache'
import { getReactiveCache, getPollingCache } from './reactive-cache'
import { PaginationCache } from './pagination-cache'
import { getPermissionCache } from './permission-cache'
import { getBackgroundSync } from './background-sync'
import { Vaga, User } from '../types/database'

interface UnifiedCacheConfig {
  enableIntelligentCache: boolean
  enablePersistentCache: boolean
  enableReactiveCache: boolean
  enablePollingCache: boolean
  enablePermissionCache: boolean
  enableBackgroundSync: boolean
  enablePaginationCache: boolean
}

interface CacheStats {
  intelligent: {
    hitRate: number
    missRate: number
    size: number
  }
  persistent: {
    size: number
    lastUpdated: number
  }
  reactive: {
    subscriptions: number
    updates: number
  }
  polling: {
    interval: number
    lastPoll: number
  }
  permission: {
    cacheSize: number
    lastCheck: number
  }
  backgroundSync: {
    isRunning: boolean
    lastSync: number
  }
  pagination: {
    cachedPages: number
    totalPages: number
  }
}

class UnifiedCache {
  private config: UnifiedCacheConfig
  private intelligentCache!: ReturnType<typeof getIntelligentCache>
  private persistentCache!: ReturnType<typeof getPersistentCache>
  private reactiveCache!: ReturnType<typeof getReactiveCache>
  private pollingCache!: ReturnType<typeof getPollingCache>
  private permissionCache!: ReturnType<typeof getPermissionCache>
  private backgroundSync!: ReturnType<typeof getBackgroundSync>
  private paginationCaches = new Map<string, PaginationCache<any>>()
  private currentUser: User | null = null
  private isInitialized = false

  constructor(config: Partial<UnifiedCacheConfig> = {}) {
    // Configuração padrão baseada no ambiente
    const isDev = import.meta.env.DEV
    
    this.config = {
      enableIntelligentCache: true,
      enablePersistentCache: !isDev, // Desabilitar em desenvolvimento
      enableReactiveCache: false, // Sempre desabilitado
      enablePollingCache: false, // Sempre desabilitado
      enablePermissionCache: !isDev, // Desabilitar em desenvolvimento
      enableBackgroundSync: false, // Sempre desabilitado
      enablePaginationCache: true,
      ...config
    }

    this.initialize()
  }

  // Inicializar sistema unificado
  private async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando Sistema Unificado de Cache...')

      // Inicializar componentes habilitados
      if (this.config.enableIntelligentCache) {
        this.intelligentCache = getIntelligentCache()
        console.log('✅ Cache Inteligente inicializado')
      }

      if (this.config.enablePersistentCache) {
        this.persistentCache = getPersistentCache()
        await this.persistentCache.initialize()
        console.log('✅ Cache Persistente inicializado')
      }

      if (this.config.enableReactiveCache) {
        this.reactiveCache = getReactiveCache()
        console.log('✅ Cache Reativo inicializado')
      }

      if (this.config.enablePollingCache) {
        this.pollingCache = getPollingCache()
        console.log('✅ Cache com Polling inicializado')
      }

      if (this.config.enablePermissionCache) {
        this.permissionCache = getPermissionCache()
        console.log('✅ Cache de Permissões inicializado')
      }

      if (this.config.enableBackgroundSync) {
        this.backgroundSync = getBackgroundSync()
        console.log('✅ Background Sync inicializado')
      }

      this.isInitialized = true
      console.log('🎉 Sistema Unificado de Cache inicializado com sucesso')

    } catch (error) {
      console.error('❌ Erro ao inicializar Sistema Unificado de Cache:', error)
    }
  }

  // Definir usuário atual
  setCurrentUser(user: User | null): void {
    this.currentUser = user

    // Propagar usuário para todos os componentes
    if (this.intelligentCache) {
      this.intelligentCache.setCurrentUser(user)
    }

    if (this.permissionCache) {
      this.permissionCache.setCurrentUser(user)
    }

    if (this.backgroundSync) {
      this.backgroundSync.setCurrentUser(user)
    }

    if (this.reactiveCache && user) {
      this.reactiveCache.connect(user)
    }

    console.log(`👤 Usuário definido no sistema unificado: ${user?.email || 'Anônimo'}`)
  }

  // Obter dados com cache unificado
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      resource?: string
      forceRefresh?: boolean
      priority?: 'high' | 'medium' | 'low'
      ttl?: number
      skipPermissionCheck?: boolean
    } = {}
  ): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Sistema de cache não inicializado')
    }

    // Verificar permissões se habilitado
    if (this.config.enablePermissionCache && options.resource && !options.skipPermissionCheck) {
      if (!this.permissionCache.canAccess(options.resource)) {
        throw new Error(`Acesso negado ao recurso: ${options.resource}`)
      }
    }

    // Tentar cache inteligente primeiro
    if (this.config.enableIntelligentCache) {
      try {
        const cacheKey = `${options.resource}:${this.currentUser?.id || 'anonymous'}`
        
        if (!options.forceRefresh) {
          const cachedData = this.intelligentCache.get<T>(cacheKey)
          if (cachedData) {
            return cachedData
          }
        }
        
        // Buscar dados do servidor
        const freshData = await fetcher()
        
        // Armazenar no cache
        this.intelligentCache.set(cacheKey, freshData, {
          ttl: options.ttl || 10 * 60 * 1000,
          dependencies: options.resource ? [options.resource] : []
        })
        
        return freshData
      } catch (error) {
        console.warn('⚠️ Cache inteligente falhou, tentando outras opções:', error)
      }
    }

    // Fallback para cache persistente
    if (this.config.enablePersistentCache && this.persistentCache) {
      try {
        const cached = await this.persistentCache.get('default', key)
        if (cached && !options.forceRefresh) {
          console.log(`📖 Dados recuperados do cache persistente: ${key}`)
          return cached as T
        }
      } catch (error) {
        console.warn('⚠️ Cache persistente falhou:', error)
      }
    }

    // Buscar dados diretamente
    console.log(`🔄 Buscando dados diretamente: ${key}`)
    const data = await fetcher()

    // Armazenar em todos os caches habilitados
    await this.storeInAllCaches(key, data, options)

    return data
  }

  // Armazenar dados em todos os caches
  private async storeInAllCaches<T>(
    key: string,
    data: T,
    options: {
      resource?: string
      ttl?: number
      priority?: 'high' | 'medium' | 'low'
    } = {}
  ): Promise<void> {
    const promises: Promise<void>[] = []

    // Cache inteligente
    if (this.config.enableIntelligentCache && options.resource) {
      const cacheKey = `${options.resource}:${this.currentUser?.id || 'anonymous'}`
      this.intelligentCache.set(cacheKey, data, {
        ttl: options.ttl || 10 * 60 * 1000,
        dependencies: options.resource ? [options.resource] : []
      })
    }

    // Cache persistente
    if (this.config.enablePersistentCache) {
      promises.push(
        this.persistentCache.set('default', key, data, {
          ttl: options.ttl,
          userId: this.currentUser?.id
        })
      )
    }

    // Cache de permissões
    if (this.config.enablePermissionCache && options.resource) {
      promises.push(
        Promise.resolve(
          this.permissionCache.set(key, data, options.resource, {
            ttl: options.ttl,
            priority: options.priority
          })
        )
      )
    }

    await Promise.allSettled(promises)
    console.log(`💾 Dados armazenados em todos os caches: ${key}`)
  }

  // Criar cache de paginação
  createPaginationCache<T>(
    name: string,
    fetcher: (page: number, pageSize: number, filters?: Record<string, any>) => Promise<{
      data: T[]
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }>,
    config?: {
      pageSize?: number
      maxPages?: number
      ttl?: number
      preloadPages?: number
    }
  ): PaginationCache<any> {
    if (!this.config.enablePaginationCache) {
      throw new Error('Cache de paginação não habilitado')
    }

    const paginationCache = new PaginationCache(fetcher, config)
    this.paginationCaches.set(name, paginationCache)
    
    console.log(`📄 Cache de paginação criado: ${name}`)
    return paginationCache as PaginationCache<T>
  }

  // Obter cache de paginação
  getPaginationCache<T>(name: string): PaginationCache<T> | null {
    return this.paginationCaches.get(name) as PaginationCache<T> | null
  }

  // Invalidar cache
  async invalidate(
    key: string,
    options: {
      resource?: string
      userId?: string
      allUsers?: boolean
    } = {}
  ): Promise<void> {
    const promises: Promise<void>[] = []

    // Cache inteligente
    if (this.config.enableIntelligentCache && options.resource) {
      this.intelligentCache.invalidateByDependency(options.resource)
    }

    // Cache persistente
    if (this.config.enablePersistentCache) {
      promises.push(
        this.persistentCache.delete('default', key)
      )
    }

    // Cache de permissões
    if (this.config.enablePermissionCache) {
      if (options.allUsers) {
        promises.push(
          Promise.resolve(this.permissionCache.clear())
        )
      } else if (options.resource) {
        promises.push(
          Promise.resolve(this.permissionCache.invalidateResourceCache(options.resource, options.userId))
        )
      }
    }

    // Cache de paginação
    if (this.config.enablePaginationCache) {
      this.paginationCaches.forEach(cache => {
        promises.push(
          Promise.resolve(cache.invalidateCache())
        )
      })
    }

    await Promise.allSettled(promises)
    console.log(`🗑️ Cache invalidado: ${key}`)
  }

  // Adicionar operação ao background sync
  async addSyncOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    data: Record<string, unknown>,
    options: {
      priority?: 'high' | 'medium' | 'low'
    } = {}
  ): Promise<string> {
    if (!this.config.enableBackgroundSync) {
      throw new Error('Background Sync não habilitado')
    }

    return this.backgroundSync.addOperation(type, table, data, options)
  }

  // Conectar cache reativo
  connectReactiveCache(): void {
    if (this.config.enableReactiveCache && this.currentUser && !import.meta.env.DEV) {
      this.reactiveCache.connect(this.currentUser)
    }
  }

  // Desconectar cache reativo
  disconnectReactiveCache(): void {
    if (this.config.enableReactiveCache) {
      this.reactiveCache.disconnect()
    }
  }

  // Iniciar polling como fallback
  startPolling(
    table: string,
    fetcher: () => Promise<any[]>,
    interval?: number
  ): void {
    if (this.config.enablePollingCache) {
      this.pollingCache.startPolling(table, fetcher, interval)
    }
  }

  // Parar polling
  stopPolling(table: string): void {
    if (this.config.enablePollingCache) {
      this.pollingCache.stopPolling(table)
    }
  }

  // Obter estatísticas unificadas
  getStats(): CacheStats {
    const stats: CacheStats = {} as CacheStats

    if (this.config.enableIntelligentCache) {
      const intelligentStats = this.intelligentCache.getStats()
      stats.intelligent = {
        hitRate: intelligentStats.hitRate || 0,
        missRate: 1 - (intelligentStats.hitRate || 0),
        size: intelligentStats.size || 0
      }
    }

    if (this.config.enablePersistentCache) {
      stats.persistent = {
        size: 0,
        lastUpdated: Date.now()
      }
    }

    if (this.config.enableReactiveCache) {
      const reactiveStatus = this.reactiveCache.getStatus()
      stats.reactive = {
        subscriptions: reactiveStatus.listeners || 0,
        updates: reactiveStatus.bufferedEvents || 0
      }
    }

    if (this.config.enablePollingCache) {
      const pollingStatus = this.pollingCache.getStatus()
      stats.polling = {
        interval: 5000, // Default interval
        lastPoll: Date.now()
      }
    }

    if (this.config.enablePermissionCache) {
      const permissionStats = this.permissionCache.getStats()
      stats.permission = {
        cacheSize: permissionStats.totalEntries || 0,
        lastCheck: Date.now()
      }
    }

    if (this.config.enableBackgroundSync) {
      stats.backgroundSync = {
        isRunning: false,
        lastSync: Date.now()
      }
    }

    if (this.config.enablePaginationCache) {
      stats.pagination = {
        cachedPages: this.paginationCaches.size,
        totalPages: 0
      }
      this.paginationCaches.forEach((cache) => {
        // stats.pagination.totalPages += cache.getTotalPagesCount()
        stats.pagination.totalPages += 1 // Default value
      })
    }

    return stats
  }

  // Limpeza geral
  async cleanup(): Promise<void> {
    const promises: Promise<void>[] = []

    if (this.config.enableIntelligentCache) {
      promises.push(Promise.resolve(this.intelligentCache.clear()))
    }

    if (this.config.enablePersistentCache) {
      promises.push(this.persistentCache.cleanup())
    }

    if (this.config.enablePermissionCache) {
      promises.push(Promise.resolve(this.permissionCache.cleanup()))
    }

    if (this.config.enableBackgroundSync) {
      promises.push(this.backgroundSync.clearCompletedOperations())
    }

    if (this.config.enablePaginationCache) {
      this.paginationCaches.forEach(cache => {
        promises.push(Promise.resolve(cache.clearCache()))
      })
    }

    await Promise.allSettled(promises)
    console.log('🧹 Limpeza geral do cache concluída')
  }

  // Limpar cache do usuário
  async clearUserCache(userId?: string): Promise<void> {
    const targetUserId = userId || this.currentUser?.id
    if (!targetUserId) return

    const promises: Promise<void>[] = []

    if (this.config.enableIntelligentCache) {
      this.intelligentCache.invalidateUserCache(targetUserId)
    }

    if (this.config.enablePersistentCache) {
      promises.push(this.persistentCache.clearUserCache(targetUserId))
    }

    if (this.config.enablePermissionCache) {
      promises.push(
        Promise.resolve(this.permissionCache.invalidateUserCache(targetUserId))
      )
    }

    await Promise.allSettled(promises)
    console.log(`🗑️ Cache do usuário limpo: ${targetUserId}`)
  }

  // Destruir sistema unificado
  destroy(): void {
    console.log('💥 Destruindo Sistema Unificado de Cache...')

    if (this.config.enableReactiveCache) {
      this.reactiveCache.destroy()
    }

    if (this.config.enablePollingCache) {
      this.pollingCache.destroy()
    }

    if (this.config.enableBackgroundSync) {
      this.backgroundSync.destroy()
    }

    if (this.config.enablePaginationCache) {
      this.paginationCaches.forEach(cache => {
        cache.destroy()
      })
      this.paginationCaches.clear()
    }

    if (this.config.enablePermissionCache) {
      this.permissionCache.destroy()
    }

    if (this.config.enablePersistentCache) {
      this.persistentCache.close()
    }

    this.currentUser = null
    this.isInitialized = false

    console.log('💥 Sistema Unificado de Cache destruído')
  }

  // Verificar se está inicializado
  isReady(): boolean {
    return this.isInitialized
  }

  // Obter configuração atual
  getConfig(): UnifiedCacheConfig {
    return { ...this.config }
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<UnifiedCacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ Configuração do cache atualizada:', newConfig)
  }
}

// Singleton
let unifiedCache: UnifiedCache | null = null

export function getUnifiedCache(): UnifiedCache {
  if (!unifiedCache) {
    unifiedCache = new UnifiedCache()
  }
  return unifiedCache
}

// Hook para usar sistema unificado
export function useUnifiedCache() {
  const cache = getUnifiedCache()
  
  return {
    // Configuração
    isReady: cache.isReady.bind(cache),
    getConfig: cache.getConfig.bind(cache),
    updateConfig: cache.updateConfig.bind(cache),
    
    // Usuário
    setCurrentUser: cache.setCurrentUser.bind(cache),
    
    // Operações básicas
    get: cache.get.bind(cache),
    invalidate: cache.invalidate.bind(cache),
    
    // Paginação
    createPaginationCache: cache.createPaginationCache.bind(cache),
    getPaginationCache: cache.getPaginationCache.bind(cache),
    
    // Background Sync
    addSyncOperation: cache.addSyncOperation.bind(cache),
    
    // Cache Reativo
    connectReactiveCache: cache.connectReactiveCache.bind(cache),
    disconnectReactiveCache: cache.disconnectReactiveCache.bind(cache),
    
    // Polling
    startPolling: cache.startPolling.bind(cache),
    stopPolling: cache.stopPolling.bind(cache),
    
    // Estatísticas e limpeza
    getStats: cache.getStats.bind(cache),
    cleanup: cache.cleanup.bind(cache),
    clearUserCache: cache.clearUserCache.bind(cache),
    destroy: cache.destroy.bind(cache)
  }
}

// Utilitários para integração com componentes existentes
export const cacheUtils = {
  // Integrar com useVagas existente
  createVagasCache: (fetcher: () => Promise<Vaga[]>) => {
    const unified = getUnifiedCache()
    return unified.createPaginationCache('vagas', async (page: number, pageSize: number, filters?: Record<string, any>) => {
      const vagas = await fetcher()
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedVagas = vagas.slice(startIndex, endIndex)
      
      return {
        data: paginatedVagas,
        totalCount: vagas.length,
        hasNextPage: endIndex < vagas.length,
        hasPrevPage: page > 1
      }
    }, {
      pageSize: 10,
      preloadPages: 2,
      maxPages: 20
    })
  },

  // Integrar com sistema de usuários
  createUsersCache: (fetcher: () => Promise<User[]>) => {
    const unified = getUnifiedCache()
    return unified.createPaginationCache('usuarios', async (page: number, pageSize: number, filters?: Record<string, any>) => {
      const users = await fetcher()
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedUsers = users.slice(startIndex, endIndex)
      
      return {
        data: paginatedUsers,
        totalCount: users.length,
        hasNextPage: endIndex < users.length,
        hasPrevPage: page > 1
      }
    }, {
      pageSize: 20,
      preloadPages: 1,
      maxPages: 10
    })
  },

  // Configurar para produção
  configureForProduction: () => {
    const unified = getUnifiedCache()
    unified.updateConfig({
      enableIntelligentCache: true,
      enablePersistentCache: true,
      enableReactiveCache: true,
      enablePollingCache: false,
      enablePermissionCache: true,
      enableBackgroundSync: true,
      enablePaginationCache: true
    })
  },

  // Configurar para desenvolvimento
  configureForDevelopment: () => {
    const unified = getUnifiedCache()
    unified.updateConfig({
      enableIntelligentCache: true,
      enablePersistentCache: false, // Desabilitar para desenvolvimento
      enableReactiveCache: false,   // Desabilitar SSE em desenvolvimento
      enablePollingCache: false,    // Desabilitar polling também
      enablePermissionCache: false,
      enableBackgroundSync: false,
      enablePaginationCache: true
    })
  }
}
