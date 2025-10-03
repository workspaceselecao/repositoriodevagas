// Sistema de Cache de Paginação Inteligente
// Pré-carrega páginas adjacentes e mantém cache otimizado para navegação fluida

interface PaginationCacheEntry<T> {
  page: number
  data: T[]
  timestamp: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  filters?: Record<string, any>
}

interface PaginationConfig {
  pageSize: number
  preloadPages: number // Páginas adjacentes para pré-carregar
  maxCachedPages: number
  ttl: number
}

interface PaginationState<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  items: T[]
  loading: boolean
  error: string | null
  hasNextPage: boolean
  hasPrevPage: boolean
}

class PaginationCache<T> {
  private cache = new Map<string, PaginationCacheEntry<T>>()
  private config: PaginationConfig
  private fetcher: (page: number, pageSize: number, filters?: Record<string, any>) => Promise<{
    data: T[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }>
  private listeners = new Set<(state: PaginationState<T>) => void>()
  private currentState: PaginationState<T>
  private preloadQueue = new Set<number>()
  private isPreloading = false

  constructor(
    fetcher: (page: number, pageSize: number, filters?: Record<string, any>) => Promise<{
      data: T[]
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }>,
    config: Partial<PaginationConfig> = {}
  ) {
    this.fetcher = fetcher
    this.config = {
      pageSize: 10,
      preloadPages: 2, // Pré-carregar 2 páginas antes e depois
      maxCachedPages: 20,
      ttl: 5 * 60 * 1000, // 5 minutos
      ...config
    }

    this.currentState = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      items: [],
      loading: false,
      error: null,
      hasNextPage: false,
      hasPrevPage: false
    }
  }

  // Obter página específica
  async getPage(
    page: number,
    filters?: Record<string, any>,
    forceRefresh: boolean = false
  ): Promise<PaginationState<T>> {
    const cacheKey = this.generateCacheKey(page, filters)
    
    // Verificar se já está carregando
    if (this.currentState.loading && this.currentState.currentPage === page) {
      return this.currentState
    }

    // Verificar cache se não forçar refresh
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.updateState(page, cached)
        this.schedulePreload(page, filters)
        return this.currentState
      }
    }

    // Carregar página
    return this.loadPage(page, filters)
  }

  // Carregar página específica
  private async loadPage(
    page: number,
    filters?: Record<string, any>
  ): Promise<PaginationState<T>> {
    const cacheKey = this.generateCacheKey(page, filters)

    this.updateState(page, null, true, null)

    try {
      console.log(`📄 Carregando página ${page}...`)
      
      const result = await this.fetcher(page, this.config.pageSize, filters)
      
      const cacheEntry: PaginationCacheEntry<T> = {
        page,
        data: result.data,
        timestamp: Date.now(),
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        filters
      }

      // Armazenar no cache
      this.setCache(cacheKey, cacheEntry)
      
      // Atualizar estado
      this.updateState(page, cacheEntry)
      
      // Agendar pré-carregamento
      this.schedulePreload(page, filters)

      console.log(`✅ Página ${page} carregada com sucesso`)
      
    } catch (error) {
      console.error(`❌ Erro ao carregar página ${page}:`, error)
      this.updateState(page, null, false, error.message)
    }

    return this.currentState
  }

  // Agendar pré-carregamento de páginas adjacentes
  private schedulePreload(currentPage: number, filters?: Record<string, any>): void {
    if (this.isPreloading) return

    this.isPreloading = true
    
    // Páginas para pré-carregar
    const pagesToPreload: number[] = []
    
    // Páginas anteriores
    for (let i = Math.max(1, currentPage - this.config.preloadPages); i < currentPage; i++) {
      pagesToPreload.push(i)
    }
    
    // Páginas posteriores
    for (let i = currentPage + 1; i <= Math.min(this.currentState.totalPages, currentPage + this.config.preloadPages); i++) {
      pagesToPreload.push(i)
    }

    // Filtrar páginas que já estão em cache
    const pagesToLoad = pagesToPreload.filter(page => {
      const cacheKey = this.generateCacheKey(page, filters)
      return !this.cache.has(cacheKey) || this.isExpired(this.cache.get(cacheKey)!)
    })

    if (pagesToLoad.length > 0) {
      console.log(`🔄 Pré-carregando páginas: ${pagesToLoad.join(', ')}`)
      this.preloadPages(pagesToLoad, filters)
    } else {
      this.isPreloading = false
    }
  }

  // Pré-carregar páginas em background
  private async preloadPages(pages: number[], filters?: Record<string, any>): Promise<void> {
    try {
      // Carregar páginas em paralelo
      const promises = pages.map(async (page) => {
        try {
          const result = await this.fetcher(page, this.config.pageSize, filters)
          
          const cacheKey = this.generateCacheKey(page, filters)
          const cacheEntry: PaginationCacheEntry<T> = {
            page,
            data: result.data,
            timestamp: Date.now(),
            totalCount: result.totalCount,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            filters
          }

          this.setCache(cacheKey, cacheEntry)
          console.log(`✅ Página ${page} pré-carregada`)
          
        } catch (error) {
          console.error(`❌ Erro ao pré-carregar página ${page}:`, error)
        }
      })

      await Promise.all(promises)
      
    } finally {
      this.isPreloading = false
    }
  }

  // Navegar para próxima página
  async nextPage(filters?: Record<string, any>): Promise<PaginationState<T>> {
    if (!this.currentState.hasNextPage) {
      throw new Error('Não há próxima página')
    }

    return this.getPage(this.currentState.currentPage + 1, filters)
  }

  // Navegar para página anterior
  async prevPage(filters?: Record<string, any>): Promise<PaginationState<T>> {
    if (!this.currentState.hasPrevPage) {
      throw new Error('Não há página anterior')
    }

    return this.getPage(this.currentState.currentPage - 1, filters)
  }

  // Ir para página específica
  async goToPage(page: number, filters?: Record<string, any>): Promise<PaginationState<T>> {
    if (page < 1 || page > this.currentState.totalPages) {
      throw new Error('Página inválida')
    }

    return this.getPage(page, filters)
  }

  // Atualizar estado interno
  private updateState(
    page: number,
    cacheEntry: PaginationCacheEntry<T> | null,
    loading: boolean = false,
    error: string | null = null
  ): void {
    if (cacheEntry) {
      const totalPages = Math.ceil(cacheEntry.totalCount / this.config.pageSize)
      
      this.currentState = {
        currentPage: page,
        totalPages,
        totalItems: cacheEntry.totalCount,
        items: cacheEntry.data,
        loading: false,
        error: null,
        hasNextPage: cacheEntry.hasNextPage,
        hasPrevPage: cacheEntry.hasPrevPage
      }
    } else {
      this.currentState = {
        ...this.currentState,
        currentPage: page,
        loading,
        error
      }
    }

    // Notificar listeners
    this.notifyListeners()
  }

  // Obter dados do cache
  private getFromCache(cacheKey: string): PaginationCacheEntry<T> | null {
    const entry = this.cache.get(cacheKey)
    
    if (!entry) return null
    
    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey)
      return null
    }

    return entry
  }

  // Armazenar no cache
  private setCache(cacheKey: string, entry: PaginationCacheEntry<T>): void {
    // Limitar tamanho do cache
    if (this.cache.size >= this.config.maxCachedPages) {
      this.evictOldestEntry()
    }

    this.cache.set(cacheKey, entry)
  }

  // Verificar se entrada expirou
  private isExpired(entry: PaginationCacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl
  }

  // Remover entrada mais antiga
  private evictOldestEntry(): void {
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
      console.log(`🗑️ Página removida do cache: ${oldestKey}`)
    }
  }

  // Gerar chave de cache
  private generateCacheKey(page: number, filters?: Record<string, any>): string {
    const filtersStr = filters ? JSON.stringify(filters) : 'default'
    return `page:${page}:${filtersStr}`
  }

  // Adicionar listener para mudanças
  addListener(callback: (state: PaginationState<T>) => void): () => void {
    this.listeners.add(callback)
    
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentState)
      } catch (error) {
        console.error('❌ Erro ao notificar listener:', error)
      }
    })
  }

  // Invalidar cache
  invalidateCache(filters?: Record<string, any>): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (!filters || JSON.stringify(entry.filters) === JSON.stringify(filters)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    console.log(`🗑️ ${keysToDelete.length} páginas removidas do cache`)
  }

  // Atualizar item específico em todas as páginas
  updateItem(itemId: string, updatedItem: T): void {
    for (const [key, entry] of this.cache.entries()) {
      const itemIndex = entry.data.findIndex((item: any) => item.id === itemId)
      if (itemIndex !== -1) {
        entry.data[itemIndex] = updatedItem
        entry.timestamp = Date.now()
        console.log(`🔄 Item atualizado na página ${entry.page}`)
      }
    }
  }

  // Remover item de todas as páginas
  removeItem(itemId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      const itemIndex = entry.data.findIndex((item: any) => item.id === itemId)
      if (itemIndex !== -1) {
        entry.data.splice(itemIndex, 1)
        entry.timestamp = Date.now()
        entry.totalCount--
        console.log(`➖ Item removido da página ${entry.page}`)
      }
    }
  }

  // Adicionar item à primeira página
  addItem(item: T): void {
    const firstPageKey = this.generateCacheKey(1)
    const firstPage = this.cache.get(firstPageKey)
    
    if (firstPage) {
      firstPage.data.unshift(item)
      firstPage.totalCount++
      firstPage.timestamp = Date.now()
      console.log(`➕ Item adicionado à primeira página`)
    }
  }

  // Obter estatísticas do cache
  getStats(): {
    cachedPages: number
    totalItems: number
    cacheHitRate: number
    oldestPage: number
    newestPage: number
  } {
    const pages = Array.from(this.cache.values())
    const totalItems = pages.reduce((sum, page) => sum + page.data.length, 0)
    const timestamps = pages.map(page => page.timestamp)
    
    return {
      cachedPages: this.cache.size,
      totalItems,
      cacheHitRate: 0, // Seria calculado com métricas de hit/miss
      oldestPage: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestPage: timestamps.length > 0 ? Math.max(...timestamps) : 0
    }
  }

  // Obter estado atual
  getCurrentState(): PaginationState<T> {
    return { ...this.currentState }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Cache de paginação limpo')
  }

  // Destruir instância
  destroy(): void {
    this.clearCache()
    this.listeners.clear()
    console.log('💥 Pagination cache destruído')
  }
}

// Hook para usar paginação com cache
export function usePaginationCache<T>(
  fetcher: (page: number, pageSize: number, filters?: Record<string, any>) => Promise<{
    data: T[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }>,
  config?: Partial<PaginationConfig>
) {
  const paginationCache = new PaginationCache(fetcher, config)

  return {
    // Navegação
    getPage: paginationCache.getPage.bind(paginationCache),
    nextPage: paginationCache.nextPage.bind(paginationCache),
    prevPage: paginationCache.prevPage.bind(paginationCache),
    goToPage: paginationCache.goToPage.bind(paginationCache),
    
    // Cache
    invalidateCache: paginationCache.invalidateCache.bind(paginationCache),
    updateItem: paginationCache.updateItem.bind(paginationCache),
    removeItem: paginationCache.removeItem.bind(paginationCache),
    addItem: paginationCache.addItem.bind(paginationCache),
    
    // Estado e listeners
    getCurrentState: paginationCache.getCurrentState.bind(paginationCache),
    addListener: paginationCache.addListener.bind(paginationCache),
    getStats: paginationCache.getStats.bind(paginationCache),
    clearCache: paginationCache.clearCache.bind(paginationCache),
    destroy: paginationCache.destroy.bind(paginationCache)
  }
}

export { PaginationCache, type PaginationState, type PaginationConfig }
