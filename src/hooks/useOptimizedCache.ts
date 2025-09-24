import { useCallback, useMemo } from 'react'
import { useCache } from '../contexts/CacheContext'
import { Vaga, VagaFilter } from '../types/database'

// Hook para otimizar operações de cache e evitar rerenders
export function useOptimizedCache() {
  const cache = useCache()

  // Memoizar funções de refresh para evitar recriação desnecessária
  const refreshFunctions = useMemo(() => ({
    vagas: cache.refreshVagas,
    clientes: cache.refreshClientes,
    sites: cache.refreshSites,
    categorias: cache.refreshCategorias,
    cargos: cache.refreshCargos,
    celulas: cache.refreshCelulas,
    usuarios: cache.refreshUsuarios,
    noticias: cache.refreshNoticias,
    all: cache.refreshAll
  }), [
    cache.refreshVagas,
    cache.refreshClientes,
    cache.refreshSites,
    cache.refreshCategorias,
    cache.refreshCargos,
    cache.refreshCelulas,
    cache.refreshUsuarios,
    cache.refreshNoticias,
    cache.refreshAll
  ])

  // Função otimizada para filtrar vagas
  const getFilteredVagas = useCallback((filter?: VagaFilter) => {
    if (!filter) return cache.cache.vagas

    return cache.cache.vagas.filter(vaga => {
      if (filter.cliente && vaga.cliente !== filter.cliente) return false
      if (filter.site && vaga.site !== filter.site) return false
      if (filter.categoria && vaga.categoria !== filter.categoria) return false
      if (filter.cargo && vaga.cargo !== filter.cargo) return false
      if (filter.celula && vaga.celula !== filter.celula) return false
      return true
    })
  }, [cache.cache.vagas])

  // Função otimizada para buscar uma vaga específica
  const getVagaById = useCallback((id: string) => {
    return cache.cache.vagas.find(vaga => vaga.id === id) || null
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas por cliente
  const getVagasByCliente = useCallback((cliente: string) => {
    return cache.cache.vagas.filter(vaga => vaga.cliente === cliente)
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas por site
  const getVagasBySite = useCallback((site: string) => {
    return cache.cache.vagas.filter(vaga => vaga.site === site)
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas por categoria
  const getVagasByCategoria = useCallback((categoria: string) => {
    return cache.cache.vagas.filter(vaga => vaga.categoria === categoria)
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas por cargo
  const getVagasByCargo = useCallback((cargo: string) => {
    return cache.cache.vagas.filter(vaga => vaga.cargo === cargo)
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas por célula
  const getVagasByCelula = useCallback((celula: string) => {
    return cache.cache.vagas.filter(vaga => vaga.celula === celula)
  }, [cache.cache.vagas])

  // Função otimizada para buscar vagas recentes
  const getVagasRecentes = useCallback((days: number = 7) => {
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return cache.cache.vagas.filter(vaga => 
      new Date(vaga.created_at) > cutoffDate
    )
  }, [cache.cache.vagas])

  // Função otimizada para buscar estatísticas
  const getStats = useCallback(() => {
    const vagas = cache.cache.vagas
    const clientes = cache.cache.clientes
    const sites = cache.cache.sites
    const usuarios = cache.cache.usuarios
    const noticias = cache.cache.noticias

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const vagasRecentes = vagas.filter(vaga => 
      new Date(vaga.created_at) > sevenDaysAgo
    ).length

    const noticiasAtivas = noticias.filter((noticia: any) => noticia.ativa).length

    return {
      totalVagas: vagas.length,
      totalClientes: clientes.length,
      totalSites: sites.length,
      totalUsuarios: usuarios.length,
      vagasAtivas: vagas.length,
      vagasRecentes,
      noticiasAtivas
    }
  }, [cache.cache])

  // Função otimizada para buscar notícias ativas
  const getNoticiasAtivas = useCallback(() => {
    return cache.cache.noticias
      .filter((noticia: any) => noticia.ativa)
      .sort((a: any, b: any) => {
        const prioridadeOrder: { [key: string]: number } = { alta: 3, media: 2, baixa: 1 }
        const aPrioridade = prioridadeOrder[a.prioridade] || 1
        const bPrioridade = prioridadeOrder[b.prioridade] || 1
        
        if (aPrioridade !== bPrioridade) {
          return bPrioridade - aPrioridade
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [cache.cache.noticias])

  return {
    // Dados do cache
    cache: cache.cache,
    loading: cache.loading,
    cacheStatus: cache.cacheStatus,
    
    // Funções de refresh
    refresh: refreshFunctions,
    
    // Funções otimizadas de busca
    getFilteredVagas,
    getVagaById,
    getVagasByCliente,
    getVagasBySite,
    getVagasByCategoria,
    getVagasByCargo,
    getVagasByCelula,
    getVagasRecentes,
    getStats,
    getNoticiasAtivas,
    
    // Funções de manipulação
    addVaga: cache.addVaga,
    updateVaga: cache.updateVaga,
    removeVaga: cache.removeVaga,
    clearCache: cache.clearCache
  }
}

// Hook para debounce de operações de cache
export function useDebouncedCache(delay: number = 300) {
  const cache = useCache()
  
  const debouncedRefresh = useCallback(
    debounce((fn: () => void) => fn(), delay),
    [delay]
  )

  return {
    ...cache,
    refreshVagas: () => debouncedRefresh(cache.refreshVagas),
    refreshClientes: () => debouncedRefresh(cache.refreshClientes),
    refreshSites: () => debouncedRefresh(cache.refreshSites),
    refreshCategorias: () => debouncedRefresh(cache.refreshCategorias),
    refreshCargos: () => debouncedRefresh(cache.refreshCargos),
    refreshCelulas: () => debouncedRefresh(cache.refreshCelulas),
    refreshUsuarios: () => debouncedRefresh(cache.refreshUsuarios),
    refreshNoticias: () => debouncedRefresh(cache.refreshNoticias),
    refreshAll: () => debouncedRefresh(cache.refreshAll)
  }
}

// Função utilitária para debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
