import { useMemo } from 'react'
import { useCache } from '../contexts/CacheContext'
import { Vaga, VagaFilter } from '../types/database'

// Hook para acessar vagas do cache
export function useVagas(filter?: VagaFilter) {
  const { cache, refreshVagas, cacheStatus, loading } = useCache()

  const vagas = useMemo(() => {
    if (!cache.vagas.length) return []

    let filteredVagas = cache.vagas

    // Aplicar filtros se fornecidos
    if (filter?.cliente) {
      filteredVagas = filteredVagas.filter(vaga => vaga.cliente === filter.cliente)
    }
    if (filter?.site) {
      filteredVagas = filteredVagas.filter(vaga => vaga.site === filter.site)
    }
    if (filter?.categoria) {
      filteredVagas = filteredVagas.filter(vaga => vaga.categoria === filter.categoria)
    }
    if (filter?.cargo) {
      filteredVagas = filteredVagas.filter(vaga => vaga.cargo === filter.cargo)
    }
    if (filter?.celula) {
      filteredVagas = filteredVagas.filter(vaga => vaga.celula === filter.celula)
    }

    return filteredVagas
  }, [cache.vagas, filter])

  return {
    vagas,
    loading: loading || (!cacheStatus.vagas && cache.vagas.length === 0),
    refresh: refreshVagas,
    hasData: cacheStatus.vagas,
    lastUpdated: cache.lastUpdated
  }
}

// Hook para acessar uma vaga específica
export function useVaga(id: string) {
  const { cache } = useCache()

  const vaga = useMemo(() => {
    return cache.vagas.find(v => v.id === id) || null
  }, [cache.vagas, id])

  return vaga
}

// Hook para acessar clientes do cache
export function useClientes() {
  const { cache, refreshClientes, cacheStatus } = useCache()

  return {
    clientes: cache.clientes,
    loading: !cacheStatus.clientes && cache.clientes.length === 0,
    refresh: refreshClientes,
    hasData: cacheStatus.clientes
  }
}

// Hook para acessar sites do cache
export function useSites() {
  const { cache, refreshSites, cacheStatus } = useCache()

  return {
    sites: cache.sites,
    loading: !cacheStatus.sites && cache.sites.length === 0,
    refresh: refreshSites,
    hasData: cacheStatus.sites
  }
}

// Hook para acessar categorias do cache
export function useCategorias() {
  const { cache, refreshCategorias, cacheStatus } = useCache()

  return {
    categorias: cache.categorias,
    loading: !cacheStatus.categorias && cache.categorias.length === 0,
    refresh: refreshCategorias,
    hasData: cacheStatus.categorias
  }
}

// Hook para acessar cargos do cache
export function useCargos() {
  const { cache, refreshCargos, cacheStatus } = useCache()

  return {
    cargos: cache.cargos,
    loading: !cacheStatus.cargos && cache.cargos.length === 0,
    refresh: refreshCargos,
    hasData: cacheStatus.cargos
  }
}

// Hook para acessar células do cache
export function useCelulas() {
  const { cache, refreshCelulas, cacheStatus } = useCache()

  return {
    celulas: cache.celulas,
    loading: !cacheStatus.celulas && cache.celulas.length === 0,
    refresh: refreshCelulas,
    hasData: cacheStatus.celulas
  }
}

// Hook para acessar usuários do cache
export function useUsuarios() {
  const { cache, refreshUsuarios, cacheStatus } = useCache()

  return {
    usuarios: cache.usuarios,
    loading: !cacheStatus.usuarios && cache.usuarios.length === 0,
    refresh: refreshUsuarios,
    hasData: cacheStatus.usuarios
  }
}

// Hook para acessar notícias do cache
export function useNoticias() {
  const { cache, refreshNoticias, cacheStatus } = useCache()

  const noticias = useMemo(() => {
    return cache.noticias
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
  }, [cache.noticias])

  return {
    noticias,
    loading: !cacheStatus.noticias && cache.noticias.length === 0,
    refresh: refreshNoticias,
    hasData: cacheStatus.noticias
  }
}

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  const vagasData = useVagas()
  const clientesData = useClientes()
  const sitesData = useSites()
  const usuariosData = useUsuarios()
  const noticiasData = useNoticias()

  const stats = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const vagasRecentes = vagasData.vagas.filter(vaga => 
      new Date(vaga.created_at) > sevenDaysAgo
    ).length

    const noticiasAtivas = noticiasData.noticias.length

    return {
      totalVagas: vagasData.vagas.length,
      totalClientes: clientesData.clientes.length,
      totalSites: sitesData.sites.length,
      totalUsuarios: usuariosData.usuarios.length,
      vagasAtivas: vagasData.vagas.length,
      vagasRecentes,
      noticiasAtivas
    }
  }, [vagasData.vagas, clientesData.clientes, sitesData.sites, usuariosData.usuarios, noticiasData.noticias])

  const loading = useMemo(() => {
    return vagasData.loading || clientesData.loading || sitesData.loading || usuariosData.loading || noticiasData.loading
  }, [vagasData.loading, clientesData.loading, sitesData.loading, usuariosData.loading, noticiasData.loading])

  return {
    stats,
    loading
  }
}
