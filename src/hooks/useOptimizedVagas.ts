// Hook otimizado para vagas usando o sistema unificado de cache
// Substitui o hook useVagas existente com funcionalidades avançadas

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Vaga, VagaFilter } from '../types/database'
import { useUnifiedCache } from '../lib/unified-cache'
import { getVagasForceRefresh } from '../lib/vagas'

interface UseOptimizedVagasOptions {
  enablePagination?: boolean
  pageSize?: number
  preloadPages?: number
  enableReactiveUpdates?: boolean
  enableBackgroundSync?: boolean
}

interface UseOptimizedVagasReturn {
  // Dados
  vagas: Vaga[]
  loading: boolean
  error: string | null
  
  // Paginação
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
  
  // Navegação
  goToPage: (page: number) => Promise<void>
  nextPage: () => Promise<void>
  prevPage: () => Promise<void>
  
  // Cache e sincronização
  refresh: () => Promise<void>
  invalidateCache: () => Promise<void>
  
  // Estatísticas
  cacheStats: any
  lastUpdated: number
  
  // Filtros
  applyFilter: (filter: VagaFilter) => Promise<void>
  clearFilters: () => Promise<void>
}

export function useOptimizedVagas(
  options: UseOptimizedVagasOptions = {}
): UseOptimizedVagasReturn {
  const {
    enablePagination = true,
    pageSize = 10,
    preloadPages = 2,
    enableReactiveUpdates = true,
    enableBackgroundSync = true
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<VagaFilter>({})
  const [lastUpdated, setLastUpdated] = useState(Date.now())

  const unifiedCache = useUnifiedCache()

  // Criar cache de paginação para vagas
  const paginationCache = useMemo(() => {
    if (!enablePagination) return null

    return unifiedCache.createPaginationCache(
      'vagas',
      async (page: number, size: number, filter?: VagaFilter) => {
        console.log(`🔄 Buscando vagas - página ${page}, filtro:`, filter)
        
        const vagas = await getVagasForceRefresh(filter)
        const totalCount = vagas.length
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedVagas = vagas.slice(startIndex, endIndex)
        
        return {
          data: paginatedVagas,
          totalCount,
          hasNextPage: endIndex < totalCount,
          hasPrevPage: page > 1
        }
      },
      {
        pageSize,
        preloadPages,
        maxCachedPages: 20,
        ttl: 15 * 60 * 1000 // 15 minutos
      }
    )
  }, [enablePagination, pageSize, preloadPages, unifiedCache])

  // Estado da paginação
  const paginationState = useMemo(() => {
    if (!paginationCache) {
      return {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        items: []
      }
    }
    return paginationCache.getCurrentState()
  }, [paginationCache])

  // Carregar vagas usando cache unificado
  const loadVagas = useCallback(async (
    page: number = 1,
    filter: VagaFilter = {},
    forceRefresh: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      if (enablePagination && paginationCache) {
        // Usar cache de paginação
        const state = await paginationCache.getPage(page, filter, forceRefresh)
        setLastUpdated(Date.now())
      } else {
        // Usar cache unificado simples
        const vagas = await unifiedCache.get(
          `vagas:${JSON.stringify(filter)}`,
          () => getVagasForceRefresh(filter),
          {
            resource: 'vagas',
            forceRefresh,
            ttl: 15 * 60 * 1000
          }
        )
        
        // Simular paginação no cliente para compatibilidade
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedVagas = vagas.slice(startIndex, endIndex)
        
        setLastUpdated(Date.now())
      }

    } catch (err) {
      console.error('❌ Erro ao carregar vagas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
    } finally {
      setLoading(false)
    }
  }, [enablePagination, paginationCache, unifiedCache, pageSize])

  // Navegação de páginas
  const goToPage = useCallback(async (page: number) => {
    if (paginationCache) {
      await paginationCache.goToPage(page, currentFilter)
    } else {
      await loadVagas(page, currentFilter)
    }
  }, [paginationCache, currentFilter, loadVagas])

  const nextPage = useCallback(async () => {
    if (paginationCache) {
      await paginationCache.nextPage(currentFilter)
    } else {
      await loadVagas(paginationState.currentPage + 1, currentFilter)
    }
  }, [paginationCache, currentFilter, paginationState.currentPage, loadVagas])

  const prevPage = useCallback(async () => {
    if (paginationCache) {
      await paginationCache.prevPage(currentFilter)
    } else {
      await loadVagas(paginationState.currentPage - 1, currentFilter)
    }
  }, [paginationCache, currentFilter, paginationState.currentPage, loadVagas])

  // Aplicar filtro
  const applyFilter = useCallback(async (filter: VagaFilter) => {
    setCurrentFilter(filter)
    await loadVagas(1, filter, true) // Forçar refresh com novo filtro
  }, [loadVagas])

  // Limpar filtros
  const clearFilters = useCallback(async () => {
    setCurrentFilter({})
    await loadVagas(1, {}, true)
  }, [loadVagas])

  // Refresh manual
  const refresh = useCallback(async () => {
    await loadVagas(paginationState.currentPage, currentFilter, true)
  }, [loadVagas, paginationState.currentPage, currentFilter])

  // Invalidar cache
  const invalidateCache = useCallback(async () => {
    await unifiedCache.invalidate('vagas', { resource: 'vagas' })
    await refresh()
  }, [unifiedCache, refresh])

  // Configurar cache reativo
  useEffect(() => {
    if (enableReactiveUpdates) {
      unifiedCache.connectReactiveCache()
    }

    return () => {
      if (enableReactiveUpdates) {
        unifiedCache.disconnectReactiveCache()
      }
    }
  }, [enableReactiveUpdates, unifiedCache])

  // Carregar dados iniciais
  useEffect(() => {
    loadVagas(1, currentFilter)
  }, []) // Apenas no mount

  // Obter estatísticas do cache
  const cacheStats = useMemo(() => {
    const stats = unifiedCache.getStats()
    return {
      ...stats,
      pagination: paginationCache ? paginationCache.getStats() : null
    }
  }, [unifiedCache, paginationCache])

  return {
    // Dados
    vagas: paginationState.items || [],
    loading,
    error,
    
    // Paginação
    currentPage: paginationState.currentPage || 1,
    totalPages: paginationState.totalPages || 1,
    totalItems: paginationState.totalItems || 0,
    hasNextPage: paginationState.hasNextPage || false,
    hasPrevPage: paginationState.hasPrevPage || false,
    
    // Navegação
    goToPage,
    nextPage,
    prevPage,
    
    // Cache e sincronização
    refresh,
    invalidateCache,
    
    // Estatísticas
    cacheStats,
    lastUpdated,
    
    // Filtros
    applyFilter,
    clearFilters
  }
}

// Hook simplificado para compatibilidade com código existente
export function useVagasOptimized(filter?: VagaFilter) {
  const {
    vagas,
    loading,
    error,
    refresh,
    lastUpdated
  } = useOptimizedVagas({
    enablePagination: false,
    enableReactiveUpdates: true
  })

  // Aplicar filtro local se fornecido
  const filteredVagas = useMemo(() => {
    if (!filter) return vagas

    return vagas.filter(vaga => {
      if (filter.cliente && !vaga.cliente.toLowerCase().includes(filter.cliente.toLowerCase())) {
        return false
      }
      if (filter.site && !vaga.site.toLowerCase().includes(filter.site.toLowerCase())) {
        return false
      }
      if (filter.categoria && !vaga.categoria.toLowerCase().includes(filter.categoria.toLowerCase())) {
        return false
      }
      if (filter.cargo && !vaga.cargo.toLowerCase().includes(filter.cargo.toLowerCase())) {
        return false
      }
      if (filter.celula && !vaga.celula.toLowerCase().includes(filter.celula.toLowerCase())) {
        return false
      }
      return true
    })
  }, [vagas, filter])

  return {
    vagas: filteredVagas,
    loading,
    error,
    refresh,
    lastUpdated,
    hasData: filteredVagas.length > 0
  }
}
