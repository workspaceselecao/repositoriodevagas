// Contexto de Dados Otimizado
// Substitui o CacheContext atual com sistema inteligente e persistente

import React, { createContext, useContext, ReactNode } from 'react'
import { useOptimizedData } from '../hooks/useOptimizedData'
import { useOptimizedRealtimeNotifications } from '../components/OptimizedRealtimeNotifications'
import { Vaga, VagaFilter } from '../types/database'

interface OptimizedDataContextType {
  // Dados principais
  vagas: {
    data: Vaga[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  clientes: {
    data: string[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  sites: {
    data: string[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  categorias: {
    data: string[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  cargos: {
    data: string[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  celulas: {
    data: string[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  usuarios: {
    data: any[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  noticias: {
    data: any[]
    loading: boolean
    error: string | null
    lastUpdated: number
    isStale: boolean
  }
  
  // Funções de controle
  refreshAll: () => Promise<void>
  refreshVagas: () => Promise<void>
  refreshClientes: () => Promise<void>
  refreshSites: () => Promise<void>
  refreshCategorias: () => Promise<void>
  refreshCargos: () => Promise<void>
  refreshCelulas: () => Promise<void>
  refreshUsuarios: () => Promise<void>
  refreshNoticias: () => Promise<void>
  
  // Funções específicas para vagas
  addVaga: (vaga: Vaga) => void
  updateVaga: (vaga: Vaga) => void
  removeVaga: (id: string) => void
  
  // Status geral
  isInitialLoading: boolean
  hasAnyData: boolean
  stats: {
    totalLoaded: number
    cacheHitRate: number
    lastRefresh: number
  }
  
  // Status de tempo real
  realtimeStatus: {
    isConnected: boolean
    lastConnected: number
    pendingReports: any[]
  }
}

const OptimizedDataContext = createContext<OptimizedDataContextType | undefined>(undefined)

export function OptimizedDataProvider({ children }: { children: ReactNode }) {
  const optimizedData = useOptimizedData()
  const realtimeNotifications = useOptimizedRealtimeNotifications()

  const value: OptimizedDataContextType = {
    // Dados
    vagas: optimizedData.vagas,
    clientes: optimizedData.clientes,
    sites: optimizedData.sites,
    categorias: optimizedData.categorias,
    cargos: optimizedData.cargos,
    celulas: optimizedData.celulas,
    usuarios: optimizedData.usuarios,
    noticias: optimizedData.noticias,
    
    // Funções de controle
    refreshAll: optimizedData.refreshAll,
    refreshVagas: optimizedData.refreshVagas,
    refreshClientes: optimizedData.refreshClientes,
    refreshSites: optimizedData.refreshSites,
    refreshCategorias: optimizedData.refreshCategorias,
    refreshCargos: optimizedData.refreshCargos,
    refreshCelulas: optimizedData.refreshCelulas,
    refreshUsuarios: optimizedData.refreshUsuarios,
    refreshNoticias: optimizedData.refreshNoticias,
    
    // Funções específicas
    addVaga: optimizedData.addVaga,
    updateVaga: optimizedData.updateVaga,
    removeVaga: optimizedData.removeVaga,
    
    // Status
    isInitialLoading: optimizedData.isInitialLoading,
    hasAnyData: optimizedData.hasAnyData,
    stats: optimizedData.stats,
    
    // Status de tempo real
    realtimeStatus: {
      isConnected: realtimeNotifications.connectionState.isConnected,
      lastConnected: realtimeNotifications.connectionState.lastConnected,
      pendingReports: realtimeNotifications.pendingReports
    }
  }

  return (
    <OptimizedDataContext.Provider value={value}>
      {children}
    </OptimizedDataContext.Provider>
  )
}

export function useOptimizedDataContext() {
  const context = useContext(OptimizedDataContext)
  if (context === undefined) {
    throw new Error('useOptimizedDataContext deve ser usado dentro de um OptimizedDataProvider')
  }
  return context
}

// Hooks de conveniência para compatibilidade
export function useOptimizedVagas(filter?: VagaFilter) {
  const { vagas, refreshVagas } = useOptimizedDataContext()
  
  const filteredVagas = filter ? vagas.data.filter(vaga => {
    if (filter.cliente && vaga.cliente !== filter.cliente) return false
    if (filter.site && vaga.site !== filter.site) return false
    if (filter.categoria && vaga.categoria !== filter.categoria) return false
    if (filter.cargo && vaga.cargo !== filter.cargo) return false
    if (filter.celula && vaga.celula !== filter.celula) return false
    return true
  }) : vagas.data

  return {
    vagas: filteredVagas,
    loading: vagas.loading,
    error: vagas.error,
    refresh: refreshVagas,
    hasData: !vagas.isStale && vagas.data.length > 0,
    lastUpdated: vagas.lastUpdated
  }
}

export function useOptimizedClientes() {
  const { clientes, refreshClientes } = useOptimizedDataContext()
  
  return {
    clientes: clientes.data,
    loading: clientes.loading,
    error: clientes.error,
    refresh: refreshClientes,
    hasData: !clientes.isStale && clientes.data.length > 0,
    lastUpdated: clientes.lastUpdated
  }
}

export function useOptimizedSites() {
  const { sites, refreshSites } = useOptimizedDataContext()
  
  return {
    sites: sites.data,
    loading: sites.loading,
    error: sites.error,
    refresh: refreshSites,
    hasData: !sites.isStale && sites.data.length > 0,
    lastUpdated: sites.lastUpdated
  }
}

export function useOptimizedCategorias() {
  const { categorias, refreshCategorias } = useOptimizedDataContext()
  
  return {
    categorias: categorias.data,
    loading: categorias.loading,
    error: categorias.error,
    refresh: refreshCategorias,
    hasData: !categorias.isStale && categorias.data.length > 0,
    lastUpdated: categorias.lastUpdated
  }
}

export function useOptimizedCargos() {
  const { cargos, refreshCargos } = useOptimizedDataContext()
  
  return {
    cargos: cargos.data,
    loading: cargos.loading,
    error: cargos.error,
    refresh: refreshCargos,
    hasData: !cargos.isStale && cargos.data.length > 0,
    lastUpdated: cargos.lastUpdated
  }
}

export function useOptimizedCelulas() {
  const { celulas, refreshCelulas } = useOptimizedDataContext()
  
  return {
    celulas: celulas.data,
    loading: celulas.loading,
    error: celulas.error,
    refresh: refreshCelulas,
    hasData: !celulas.isStale && celulas.data.length > 0,
    lastUpdated: celulas.lastUpdated
  }
}

export function useOptimizedUsuarios() {
  const { usuarios, refreshUsuarios } = useOptimizedDataContext()
  
  return {
    usuarios: usuarios.data,
    loading: usuarios.loading,
    error: usuarios.error,
    refresh: refreshUsuarios,
    hasData: !usuarios.isStale && usuarios.data.length > 0,
    lastUpdated: usuarios.lastUpdated
  }
}

export function useOptimizedNoticias() {
  const { noticias, refreshNoticias } = useOptimizedDataContext()
  
  const activeNoticias = noticias.data
    .filter(noticia => noticia.ativa)
    .sort((a, b) => {
      const prioridadeOrder: { [key: string]: number } = { alta: 3, media: 2, baixa: 1 }
      const aPrioridade = prioridadeOrder[a.prioridade] || 1
      const bPrioridade = prioridadeOrder[b.prioridade] || 1
      
      if (aPrioridade !== bPrioridade) {
        return bPrioridade - aPrioridade
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  
  return {
    noticias: activeNoticias,
    loading: noticias.loading,
    error: noticias.error,
    refresh: refreshNoticias,
    hasData: !noticias.isStale && noticias.data.length > 0,
    lastUpdated: noticias.lastUpdated
  }
}

export function useOptimizedDashboardStats() {
  const { vagas, clientes, sites, usuarios, noticias, stats } = useOptimizedDataContext()
  
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const vagasRecentes = vagas.data.filter(vaga => 
    new Date(vaga.created_at) > sevenDaysAgo
  ).length

  const noticiasAtivas = noticias.data.filter(noticia => noticia.ativa).length

  return {
    stats: {
      totalVagas: vagas.data.length,
      totalClientes: clientes.data.length,
      totalSites: sites.data.length,
      totalUsuarios: usuarios.data.length,
      vagasAtivas: vagas.data.length,
      vagasRecentes,
      noticiasAtivas,
      cacheHitRate: stats.cacheHitRate,
      lastRefresh: stats.lastRefresh
    },
    loading: vagas.loading || clientes.loading || sites.loading || usuarios.loading || noticias.loading
  }
}
