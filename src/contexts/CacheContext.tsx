import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Vaga } from '../types/database'
import { getVagas, getClientes, getSites, getCategorias, getCargos, getCelulas } from '../lib/vagas'
import { getAllUsers } from '../lib/auth'
import { getNoticias } from '../lib/noticias'
import { useAuth } from './AuthContext'

// Tipos para o cache
interface CacheData {
  vagas: Vaga[]
  clientes: string[]
  sites: string[]
  categorias: string[]
  cargos: string[]
  celulas: string[]
  usuarios: any[]
  noticias: any[]
  lastUpdated: number
}

interface CacheContextType {
  // Dados do cache
  cache: CacheData
  loading: boolean
  
  // Funções para atualizar dados específicos
  refreshVagas: () => Promise<void>
  refreshClientes: () => Promise<void>
  refreshSites: () => Promise<void>
  refreshCategorias: () => Promise<void>
  refreshCargos: () => Promise<void>
  refreshCelulas: () => Promise<void>
  refreshUsuarios: () => Promise<void>
  refreshNoticias: () => Promise<void>
  
  // Função para atualizar tudo
  refreshAll: () => Promise<void>
  
  // Funções para adicionar/atualizar dados no cache
  addVaga: (vaga: Vaga) => void
  updateVaga: (vaga: Vaga) => void
  removeVaga: (vagaId: string) => void
  
  // Função para limpar cache
  clearCache: () => void
  
  // Status de cada seção do cache
  cacheStatus: {
    vagas: boolean
    clientes: boolean
    sites: boolean
    categorias: boolean
    cargos: boolean
    celulas: boolean
    usuarios: boolean
    noticias: boolean
  }
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

// Chave para armazenamento local
const CACHE_KEY = 'repositoriodevagas_cache'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutos

// Estado inicial do cache
const initialCache: CacheData = {
  vagas: [],
  clientes: [],
  sites: [],
  categorias: [],
  cargos: [],
  celulas: [],
  usuarios: [],
  noticias: [],
  lastUpdated: 0
}

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<CacheData>(initialCache)
  const [loading, setLoading] = useState(false)
  const [cacheStatus, setCacheStatus] = useState({
    vagas: false,
    clientes: false,
    sites: false,
    categorias: false,
    cargos: false,
    celulas: false,
    usuarios: false,
    noticias: false
  })
  
  const { user } = useAuth()

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    const loadCacheFromStorage = () => {
      try {
        const storedCache = localStorage.getItem(CACHE_KEY)
        if (storedCache) {
          const parsedCache = JSON.parse(storedCache)
          const now = Date.now()
          
          // Verificar se o cache não expirou
          if (now - parsedCache.lastUpdated < CACHE_EXPIRY) {
            setCache(parsedCache)
            setCacheStatus({
              vagas: parsedCache.vagas.length > 0,
              clientes: parsedCache.clientes.length > 0,
              sites: parsedCache.sites.length > 0,
              categorias: parsedCache.categorias.length > 0,
              cargos: parsedCache.cargos.length > 0,
              celulas: parsedCache.celulas.length > 0,
              usuarios: parsedCache.usuarios.length > 0,
              noticias: parsedCache.noticias.length > 0
            })
            console.log('📦 Cache carregado do localStorage')
            return
          } else {
            console.log('⏰ Cache expirado, será recarregado')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cache do localStorage:', error)
      }
    }

    loadCacheFromStorage()
  }, [])

  // Salvar cache no localStorage sempre que ele for atualizado
  useEffect(() => {
    if (cache.lastUpdated > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
        console.log('💾 Cache salvo no localStorage')
      } catch (error) {
        console.error('Erro ao salvar cache no localStorage:', error)
      }
    }
  }, [cache])

  // Função para atualizar status do cache
  const updateCacheStatus = useCallback((section: keyof typeof cacheStatus, hasData: boolean) => {
    setCacheStatus(prev => ({
      ...prev,
      [section]: hasData
    }))
  }, [])

  // Função para buscar vagas
  const refreshVagas = useCallback(async () => {
    try {
      console.log('🔄 Carregando vagas...')
      const vagas = await getVagas()
      setCache(prev => ({
        ...prev,
        vagas,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('vagas', vagas.length > 0)
      console.log(`✅ ${vagas.length} vagas carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar vagas:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar clientes
  const refreshClientes = useCallback(async () => {
    try {
      console.log('🔄 Carregando clientes...')
      const clientes = await getClientes()
      setCache(prev => ({
        ...prev,
        clientes,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('clientes', clientes.length > 0)
      console.log(`✅ ${clientes.length} clientes carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar sites
  const refreshSites = useCallback(async () => {
    try {
      console.log('🔄 Carregando sites...')
      const sites = await getSites()
      setCache(prev => ({
        ...prev,
        sites,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('sites', sites.length > 0)
      console.log(`✅ ${sites.length} sites carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar sites:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar categorias
  const refreshCategorias = useCallback(async () => {
    try {
      console.log('🔄 Carregando categorias...')
      const categorias = await getCategorias()
      setCache(prev => ({
        ...prev,
        categorias,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('categorias', categorias.length > 0)
      console.log(`✅ ${categorias.length} categorias carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar cargos
  const refreshCargos = useCallback(async () => {
    try {
      console.log('🔄 Carregando cargos...')
      const cargos = await getCargos()
      setCache(prev => ({
        ...prev,
        cargos,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('cargos', cargos.length > 0)
      console.log(`✅ ${cargos.length} cargos carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar cargos:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar células
  const refreshCelulas = useCallback(async () => {
    try {
      console.log('🔄 Carregando células...')
      const celulas = await getCelulas()
      setCache(prev => ({
        ...prev,
        celulas,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('celulas', celulas.length > 0)
      console.log(`✅ ${celulas.length} células carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar células:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar usuários
  const refreshUsuarios = useCallback(async () => {
    try {
      console.log('🔄 Carregando usuários...')
      const usuarios = await getAllUsers()
      setCache(prev => ({
        ...prev,
        usuarios,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('usuarios', usuarios.length > 0)
      console.log(`✅ ${usuarios.length} usuários carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
    }
  }, [updateCacheStatus])

  // Função para buscar notícias
  const refreshNoticias = useCallback(async () => {
    try {
      console.log('🔄 Carregando notícias...')
      const noticias = await getNoticias()
      setCache(prev => ({
        ...prev,
        noticias,
        lastUpdated: Date.now()
      }))
      updateCacheStatus('noticias', noticias.length > 0)
      console.log(`✅ ${noticias.length} notícias carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar notícias:', error)
    }
  }, [updateCacheStatus])

  // Função para atualizar tudo
  const refreshAll = useCallback(async () => {
    if (loading) return // Evitar múltiplas execuções simultâneas
    
    try {
      setLoading(true)
      console.log('🔄 Carregando todos os dados...')
      
      // Carregar dados em paralelo
      await Promise.all([
        refreshVagas(),
        refreshClientes(),
        refreshSites(),
        refreshCategorias(),
        refreshCargos(),
        refreshCelulas(),
        refreshUsuarios(),
        refreshNoticias()
      ])
      
      console.log('✅ Todos os dados carregados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, refreshVagas, refreshClientes, refreshSites, refreshCategorias, refreshCargos, refreshCelulas, refreshUsuarios, refreshNoticias])

  // Função para adicionar vaga ao cache
  const addVaga = useCallback((vaga: Vaga) => {
    setCache(prev => ({
      ...prev,
      vagas: [vaga, ...prev.vagas],
      lastUpdated: Date.now()
    }))
    console.log('➕ Vaga adicionada ao cache')
  }, [])

  // Função para atualizar vaga no cache
  const updateVaga = useCallback((vaga: Vaga) => {
    setCache(prev => ({
      ...prev,
      vagas: prev.vagas.map(v => v.id === vaga.id ? vaga : v),
      lastUpdated: Date.now()
    }))
    console.log('🔄 Vaga atualizada no cache')
  }, [])

  // Função para remover vaga do cache
  const removeVaga = useCallback((vagaId: string) => {
    setCache(prev => ({
      ...prev,
      vagas: prev.vagas.filter(v => v.id !== vagaId),
      lastUpdated: Date.now()
    }))
    console.log('➖ Vaga removida do cache')
  }, [])

  // Função para limpar cache
  const clearCache = useCallback(() => {
    setCache(initialCache)
    setCacheStatus({
      vagas: false,
      clientes: false,
      sites: false,
      categorias: false,
      cargos: false,
      celulas: false,
      usuarios: false,
      noticias: false
    })
    localStorage.removeItem(CACHE_KEY)
    console.log('🗑️ Cache limpo')
  }, [])

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (user && !loading) {
      const now = Date.now()
      const shouldRefresh = now - cache.lastUpdated > CACHE_EXPIRY
      
      if (shouldRefresh || !cacheStatus.vagas) {
        console.log('👤 Usuário logado, carregando dados...')
        refreshAll()
      } else {
        console.log('📦 Usando cache existente')
      }
    }
  }, [user, loading, cache.lastUpdated, cacheStatus.vagas, refreshAll])

  // Escutar eventos de atualização de vagas
  useEffect(() => {
    const handleVagaCreated = (event: CustomEvent) => {
      addVaga(event.detail)
    }

    const handleVagasUpdated = (event: CustomEvent) => {
      setCache(prev => ({
        ...prev,
        vagas: event.detail,
        lastUpdated: Date.now()
      }))
    }

    window.addEventListener('vaga-created', handleVagaCreated as EventListener)
    window.addEventListener('vagas-updated', handleVagasUpdated as EventListener)

    return () => {
      window.removeEventListener('vaga-created', handleVagaCreated as EventListener)
      window.removeEventListener('vagas-updated', handleVagasUpdated as EventListener)
    }
  }, [addVaga])

  const value = {
    cache,
    loading,
    refreshVagas,
    refreshClientes,
    refreshSites,
    refreshCategorias,
    refreshCargos,
    refreshCelulas,
    refreshUsuarios,
    refreshNoticias,
    refreshAll,
    addVaga,
    updateVaga,
    removeVaga,
    clearCache,
    cacheStatus
  }

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('useCache deve ser usado dentro de um CacheProvider')
  }
  return context
}
