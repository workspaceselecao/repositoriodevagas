// Sistema de Cache Inteligente e Persistente
// Solução completa para dados fluidos e disponíveis

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  version: string
  dependencies: string[]
  lastAccessed: number
}

interface CacheConfig {
  enablePersistentCache: boolean
  enableReactiveCache: boolean
  enableIntelligentRefresh: boolean
  defaultTTL: number
  maxCacheSize: number
  enableBackgroundSync: boolean
  enableOptimisticUpdates: boolean
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  memoryUsage: number
  lastCleanup: number
}

class IntelligentCache {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private stats: CacheStats
  private backgroundSyncInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null
  private version = '1.0.0'

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enablePersistentCache: true,
      enableReactiveCache: true,
      enableIntelligentRefresh: true,
      defaultTTL: 10 * 60 * 1000, // 10 minutos
      maxCacheSize: 500,
      enableBackgroundSync: true,
      enableOptimisticUpdates: true,
      ...config
    }

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memoryUsage: 0,
      lastCleanup: Date.now()
    }

    this.initializePersistentStorage()
    this.startBackgroundSync()
    this.startCleanupProcess()
    
    console.log('🚀 Cache Inteligente inicializado:', this.config)
  }

  // Inicializar armazenamento persistente
  private async initializePersistentStorage() {
    if (!this.config.enablePersistentCache) return

    try {
      // Carregar dados do localStorage se disponível
      const savedData = localStorage.getItem('intelligent-cache')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.version === this.version) {
          this.memoryCache = new Map(parsed.entries)
          this.stats = parsed.stats || this.stats
          console.log('📖 Cache persistente restaurado do localStorage')
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao restaurar cache persistente:', error)
    }
  }

  // Salvar cache no localStorage
  private saveToPersistentStorage() {
    if (!this.config.enablePersistentCache) return

    try {
      const data = {
        version: this.version,
        entries: Array.from(this.memoryCache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      }
      localStorage.setItem('intelligent-cache', JSON.stringify(data))
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache persistente:', error)
    }
  }

  // Armazenar dados no cache
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number
      dependencies?: string[]
      version?: string
    } = {}
  ): void {
    const ttl = options.ttl || this.config.defaultTTL
    const now = Date.now()

    // Verificar se precisa limpar cache
    if (this.memoryCache.size >= this.config.maxCacheSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      version: options.version || this.version,
      dependencies: options.dependencies || [],
      lastAccessed: now
    }

    this.memoryCache.set(key, entry)
    this.stats.size = this.memoryCache.size
    this.saveToPersistentStorage()

    console.log(`💾 Dados armazenados no cache inteligente: ${key}`, {
      ttl: Math.round(ttl / 1000) + 's',
      dependencies: entry.dependencies.length
    })
  }

  // Recuperar dados do cache
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    
    // Verificar se expirou
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key)
      this.stats.misses++
      this.stats.size = this.memoryCache.size
      return null
    }

    // Atualizar último acesso
    entry.lastAccessed = now
    this.stats.hits++
    
    return entry.data
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const entry = this.memoryCache.get(key)
    if (!entry) return false
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key)
      this.stats.size = this.memoryCache.size
      return false
    }
    
    return true
  }

  // Invalidar cache por dependências
  invalidateByDependency(dependency: string): void {
    let invalidated = 0
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.dependencies.includes(dependency)) {
        this.memoryCache.delete(key)
        invalidated++
      }
    }
    
    if (invalidated > 0) {
      this.stats.size = this.memoryCache.size
      this.saveToPersistentStorage()
      console.log(`🗑️ Invalidados ${invalidated} itens do cache por dependência: ${dependency}`)
    }
  }

  // Método de compatibilidade para sistemas legados
  invalidate(key: string): void {
    this.delete(key)
  }

  // Configurar usuário atual (compatibilidade)
  setCurrentUser(user: any): void {
    this.set('current-user', user, { ttl: 24 * 60 * 60 * 1000 }) // 24 horas
  }

  // Invalidar cache do usuário (compatibilidade)
  invalidateUserCache(userId: string): void {
    this.invalidateByDependency('user')
    this.invalidateByDependency(`user-${userId}`)
  }

  // Remover entrada específica
  delete(key: string): void {
    if (this.memoryCache.delete(key)) {
      this.stats.size = this.memoryCache.size
      this.saveToPersistentStorage()
      console.log(`🗑️ Entrada removida do cache: ${key}`)
    }
  }

  // Limpar cache completo
  clear(): void {
    this.memoryCache.clear()
    this.stats.size = 0
    this.saveToPersistentStorage()
    console.log('🗑️ Cache inteligente limpo completamente')
  }

  // Remover entrada mais antiga
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
      console.log(`🗑️ Entrada mais antiga removida: ${oldestKey}`)
    }
  }

  // Sincronização em background
  private startBackgroundSync(): void {
    if (!this.config.enableBackgroundSync) return

    this.backgroundSyncInterval = setInterval(() => {
      this.performBackgroundSync()
    }, 5 * 60 * 1000) // A cada 5 minutos
  }

  // Sincronização em background
  private async performBackgroundSync(): Promise<void> {
    console.log('🔄 Executando sincronização em background...')
    
    // Limpar entradas expiradas
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      this.stats.size = this.memoryCache.size
      console.log(`🧹 ${cleaned} entradas expiradas removidas`)
    }
    
    // Salvar estado atual
    this.saveToPersistentStorage()
  }

  // Processo de limpeza
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 30 * 60 * 1000) // A cada 30 minutos
  }

  // Limpeza completa
  private performCleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.memoryCache.entries()) {
      // Remover entradas expiradas ou muito antigas
      if (now - entry.timestamp > entry.ttl || 
          now - entry.lastAccessed > 60 * 60 * 1000) { // 1 hora sem acesso
        this.memoryCache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      this.stats.size = this.memoryCache.size
      this.saveToPersistentStorage()
      this.stats.lastCleanup = now
      console.log(`🧹 Limpeza automática: ${cleaned} entradas removidas`)
    }
  }

  // Obter estatísticas
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    }
  }

  // Obter informações de debug
  getDebugInfo(): any {
    return {
      config: this.config,
      stats: this.getStats(),
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        key,
        age: Math.round((Date.now() - entry.timestamp) / 1000),
        ttl: Math.round(entry.ttl / 1000),
        dependencies: entry.dependencies,
        lastAccessed: Math.round((Date.now() - entry.lastAccessed) / 1000)
      }))
    }
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ Configuração do cache atualizada:', newConfig)
  }

  // Destruir cache
  destroy(): void {
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
    console.log('💥 Cache inteligente destruído')
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

// Hook para usar cache inteligente
export function useIntelligentCache() {
  const cache = getIntelligentCache()
  
  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    invalidateByDependency: cache.invalidateByDependency.bind(cache),
    invalidate: cache.invalidate.bind(cache),
    setCurrentUser: cache.setCurrentUser.bind(cache),
    invalidateUserCache: cache.invalidateUserCache.bind(cache),
    getStats: cache.getStats.bind(cache),
    getDebugInfo: cache.getDebugInfo.bind(cache),
    updateConfig: cache.updateConfig.bind(cache)
  }
}