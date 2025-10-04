import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Vaga, User, Noticia } from '../types/database'
import { getVagas, getClientes, getSites, getCategorias, getCargos, getCelulas, getVagasForceRefresh } from '../lib/vagas'
import { getAllUsers } from '../lib/auth'
import { getNoticias } from '../lib/noticias'
import { useAuth } from './AuthContext'
import { sessionCache } from '../lib/session-cache'
import { useUnifiedCache } from '../lib/unified-cache'
import { isDbLoadingBlocked } from '../lib/supabase'

// Tipos para o cache
interface CacheData {
  vagas: Vaga[]
  clientes: string[]
  sites: string[]
  categorias: string[]
  cargos: string[]
  celulas: string[]
  usuarios: User[]
  noticias: Noticia[]
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
  
  // Função para forçar carregamento inicial
  forceInitialLoad: () => Promise<void>
  
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
  const [isInitialized, setIsInitialized] = useState(false)
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
  const unifiedCache = useUnifiedCache()

  // Função para atualizar status do cache
  const updateCacheStatus = useCallback((section: keyof typeof cacheStatus, hasData: boolean) => {
    setCacheStatus(prev => ({
      ...prev,
      [section]: hasData
    }))
  }, [])

  // Função para buscar vagas
  const refreshVagas = useCallback(async () => {
    // Verificar se o carregamento está bloqueado
    if (isDbLoadingBlocked()) {
      console.log('🚫 Carregamento de vagas BLOQUEADO - retornando dados vazios')
      setCache(prev => ({
        ...prev,
        vagas: [],
        lastUpdated: Date.now()
      }))
      updateCacheStatus('vagas', false)
      return
    }

    try {
      console.log('🔄 Carregando vagas (FORÇANDO refresh do DB)...')
      setLoading(true) // Adicionar loading durante refresh
      
      // Limpar cache de sessão para vagas antes de buscar
      console.log('🗑️ Limpando cache antes do refresh...')
      
      // Usar getVagasForceRefresh para ignorar cache e buscar diretamente do DB
      const vagas = await getVagasForceRefresh()
      
      setCache(prev => ({
        ...prev,
        vagas,
        lastUpdated: Date.now()
      }))
      
      updateCacheStatus('vagas', vagas.length > 0)
      console.log(`✅ ${vagas.length} vagas carregadas diretamente do DB`)
      
      // Forçar re-render dos componentes que usam vagas
      setTimeout(() => {
        setLoading(false)
      }, 100)
      
    } catch (error) {
      console.error('❌ Erro ao carregar vagas:', error)
      setLoading(false)
    }
  }, [updateCacheStatus])

  // Função para buscar clientes
  const refreshClientes = useCallback(async () => {
    if (isDbLoadingBlocked()) {
      console.log('🚫 Carregamento de clientes BLOQUEADO')
      setCache(prev => ({ ...prev, clientes: [], lastUpdated: Date.now() }))
      updateCacheStatus('clientes', false)
      return
    }

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

  // Função para forçar carregamento inicial
  const forceInitialLoad = useCallback(async () => {
    console.log('🚀 Forçando carregamento inicial de todos os dados...')
    setLoading(true)
    
    try {
      // Carregar todas as seções em paralelo
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
      console.log('✅ Carregamento inicial forçado concluído')
      
    } catch (error) {
      console.error('❌ Erro no carregamento inicial forçado:', error)
    } finally {
      setLoading(false)
    }
  }, [refreshVagas, refreshClientes, refreshSites, refreshCategorias, refreshCargos, refreshCelulas, refreshUsuarios, refreshNoticias])

  // Função para atualizar tudo
  const refreshAll = useCallback(async () => {
    if (loading) return
    
    try {
      setLoading(true)
      console.log('🔄 Carregando todos os dados...')
      
      // Carregar todas as seções em paralelo
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
    console.log('🗑️ Cache limpo')
  }, [])

  // Configurar usuário no cache unificado
  useEffect(() => {
    if (user) {
      try {
        // Converter AuthUser para User (compatibilidade de tipos)
        const userForCache = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          password_hash: '', // Não usado no cache
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        unifiedCache.setCurrentUser(userForCache)
      } catch (error) {
        console.warn('⚠️ Erro ao configurar usuário no cache unificado:', error)
      }
      
      // Configurar para desenvolvimento (desabilitar cache reativo)
      unifiedCache.updateConfig({
        enableReactiveCache: false, // Desabilitar SSE que está causando erros
        enablePollingCache: false,  // Desabilitar polling também
        enableIntelligentCache: true,
        enablePersistentCache: false, // Desabilitar IndexedDB em desenvolvimento
        enablePermissionCache: false, // Desabilitar cache de permissões
        enableBackgroundSync: false, // Desabilitar por enquanto
        enablePaginationCache: true
      })
      
      console.log('👤 Usuário configurado no cache unificado (modo desenvolvimento)')
    }
  }, [user, unifiedCache])

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('👤 Usuário logado - carregando dados...')
      setIsInitialized(true)
      forceInitialLoad()
    }
  }, [user?.id, isInitialized, forceInitialLoad])

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
    forceInitialLoad,
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
