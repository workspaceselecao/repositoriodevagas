// Hook Otimizado para Carregamento de Dados
// Elimina recarregamentos desnecessários e melhora a experiência do usuário

import { useState, useEffect, useCallback, useRef } from 'react'
import { Vaga, VagaFilter } from '../types/database'
import { getVagasForceRefresh, getClientes, getSites, getCategorias, getCargos, getCelulas } from '../lib/vagas'
import { getAllUsers } from '../lib/auth'
import { getNoticias } from '../lib/noticias'
import { useIntelligentCache } from '../lib/intelligent-cache'
import { useAuth } from '../contexts/AuthContext'

interface DataState<T> {
  data: T[]
  loading: boolean
  error: string | null
  lastUpdated: number
  isStale: boolean
}

interface OptimizedDataReturn {
  // Dados principais
  vagas: DataState<Vaga>
  clientes: DataState<string>
  sites: DataState<string>
  categorias: DataState<string>
  cargos: DataState<string>
  celulas: DataState<string>
  usuarios: DataState<any>
  noticias: DataState<any>
  
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
  
  // Funções específicas
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
}

export function useOptimizedData(): OptimizedDataReturn {
  const { user } = useAuth()
  const cache = useIntelligentCache()
  
  // Estados dos dados
  const [vagas, setVagas] = useState<DataState<Vaga>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [clientes, setClientes] = useState<DataState<string>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [sites, setSites] = useState<DataState<string>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [categorias, setCategorias] = useState<DataState<string>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [cargos, setCargos] = useState<DataState<string>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [celulas, setCelulas] = useState<DataState<string>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [usuarios, setUsuarios] = useState<DataState<any>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [noticias, setNoticias] = useState<DataState<any>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: 0,
    isStale: true
  })
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(0)
  
  // Refs para controle de carregamento
  const loadingRef = useRef<Set<string>>(new Set())
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função genérica para carregar dados com cache inteligente
  const loadData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T[]>,
    setter: React.Dispatch<React.SetStateAction<DataState<T>>>,
    dependencies: string[] = []
  ): Promise<void> => {
    // Evitar carregamentos duplicados
    if (loadingRef.current.has(key)) {
      console.log(`⏳ ${key} já está sendo carregado, aguardando...`)
      return
    }

    try {
      loadingRef.current.add(key)
      setter((prev: DataState<T>) => ({ ...prev, loading: true, error: null }))

      // Tentar cache primeiro
      const cachedData = cache.get<T[]>(key)
      if (cachedData && cachedData.length > 0) {
        console.log(`📖 ${key} carregados do cache (${cachedData.length} itens)`)
        setter({
          data: cachedData,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
          isStale: false
        })
        loadingRef.current.delete(key)
        return
      }

      // Carregar do servidor
      console.log(`🔄 Carregando ${key} do servidor...`)
      const freshData = await fetcher()
      
      // Validar dados
      if (!Array.isArray(freshData)) {
        throw new Error(`Dados inválidos recebidos para ${key}`)
      }

      // Armazenar no cache com dependências
      cache.set(key, freshData, {
        ttl: 10 * 60 * 1000, // 10 minutos
        dependencies,
        version: '1.0.0'
      })

      setter({
        data: freshData,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        isStale: false
      })

      console.log(`✅ ${key} carregados com sucesso (${freshData.length} itens)`)

    } catch (error) {
      console.error(`❌ Erro ao carregar ${key}:`, error)
      setter((prev: DataState<T>) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Erro ao carregar ${key}`,
        isStale: true
      }))
    } finally {
      loadingRef.current.delete(key)
    }
  }, [cache])

  // Funções específicas de carregamento
  const refreshVagas = useCallback(async () => {
    await loadData(
      'vagas:all',
      getVagasForceRefresh,
      setVagas,
      ['vagas']
    )
  }, [loadData])

  const refreshClientes = useCallback(async () => {
    await loadData(
      'clientes:all',
      getClientes,
      setClientes,
      ['vagas']
    )
  }, [loadData])

  const refreshSites = useCallback(async () => {
    await loadData(
      'sites:all',
      getSites,
      setSites,
      ['vagas']
    )
  }, [loadData])

  const refreshCategorias = useCallback(async () => {
    await loadData(
      'categorias:all',
      getCategorias,
      setCategorias,
      ['vagas']
    )
  }, [loadData])

  const refreshCargos = useCallback(async () => {
    await loadData(
      'cargos:all',
      getCargos,
      setCargos,
      ['vagas']
    )
  }, [loadData])

  const refreshCelulas = useCallback(async () => {
    await loadData(
      'celulas:all',
      getCelulas,
      setCelulas,
      ['vagas']
    )
  }, [loadData])

  const refreshUsuarios = useCallback(async () => {
    await loadData(
      'usuarios:all',
      getAllUsers,
      setUsuarios,
      ['usuarios']
    )
  }, [loadData])

  const refreshNoticias = useCallback(async () => {
    await loadData(
      'noticias:all',
      getNoticias,
      setNoticias,
      ['noticias']
    )
  }, [loadData])

  // Carregar todos os dados em paralelo
  const refreshAll = useCallback(async () => {
    console.log('🚀 Carregando todos os dados otimizados...')
    setIsInitialLoading(true)
    
    try {
      // Carregar tudo em paralelo para máxima performance
      const promises = [
        refreshVagas(),
        refreshClientes(),
        refreshSites(),
        refreshCategorias(),
        refreshCargos(),
        refreshCelulas(),
        refreshUsuarios(),
        refreshNoticias()
      ]
      
      await Promise.all(promises)
      setLastRefresh(Date.now())
      console.log('✅ Todos os dados carregados com sucesso')
      
    } catch (error) {
      console.error('❌ Erro ao carregar todos os dados:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }, [refreshVagas, refreshClientes, refreshSites, refreshCategorias, refreshCargos, refreshCelulas, refreshUsuarios, refreshNoticias])

  // Funções para manipular vagas
  const addVaga = useCallback((vaga: Vaga) => {
    setVagas(prev => ({
      ...prev,
      data: [vaga, ...prev.data],
      lastUpdated: Date.now(),
      isStale: false
    }))
    
    // Invalidar dependências
    cache.invalidateByDependency('vagas')
    console.log('➕ Vaga adicionada e dependências invalidadas')
  }, [cache])

  const updateVaga = useCallback((vaga: Vaga) => {
    setVagas(prev => ({
      ...prev,
      data: prev.data.map(v => v.id === vaga.id ? vaga : v),
      lastUpdated: Date.now(),
      isStale: false
    }))
    
    // Invalidar dependências
    cache.invalidateByDependency('vagas')
    console.log('🔄 Vaga atualizada e dependências invalidadas')
  }, [cache])

  const removeVaga = useCallback((id: string) => {
    setVagas(prev => ({
      ...prev,
      data: prev.data.filter(v => v.id !== id),
      lastUpdated: Date.now(),
      isStale: false
    }))
    
    // Invalidar dependências
    cache.invalidateByDependency('vagas')
    console.log('➖ Vaga removida e dependências invalidadas')
  }, [cache])

  // Carregar dados iniciais quando usuário fizer login
  useEffect(() => {
    if (user && isInitialLoading) {
      console.log('👤 Usuário logado - iniciando carregamento otimizado...')
      
      // Usar timeout para evitar carregamentos muito rápidos
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAll()
      }, 100)
    }
  }, [user?.id, isInitialLoading, refreshAll])

  // Configurar cache otimizado
  useEffect(() => {
    if (user) {
      cache.updateConfig({
        enablePersistentCache: true,
        enableReactiveCache: true,
        enableIntelligentRefresh: true,
        enableBackgroundSync: true,
        enableOptimisticUpdates: true,
        defaultTTL: 10 * 60 * 1000, // 10 minutos
        maxCacheSize: 1000
      })
      console.log('⚙️ Cache configurado para modo otimizado')
    }
  }, [user, cache])

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Calcular estatísticas
  const stats = {
    totalLoaded: vagas.data.length + clientes.data.length + sites.data.length + 
                categorias.data.length + cargos.data.length + celulas.data.length + 
                usuarios.data.length + noticias.data.length,
    cacheHitRate: cache.getStats().hitRate,
    lastRefresh
  }

  const hasAnyData = stats.totalLoaded > 0

  return {
    // Dados
    vagas,
    clientes,
    sites,
    categorias,
    cargos,
    celulas,
    usuarios,
    noticias,
    
    // Funções de controle
    refreshAll,
    refreshVagas,
    refreshClientes,
    refreshSites,
    refreshCategorias,
    refreshCargos,
    refreshCelulas,
    refreshUsuarios,
    refreshNoticias,
    
    // Funções específicas
    addVaga,
    updateVaga,
    removeVaga,
    
    // Status
    isInitialLoading,
    hasAnyData,
    stats
  }
}
