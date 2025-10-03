// Hook Simplificado para Vagas - Modo Desenvolvimento
// Usa apenas cache em memória para evitar problemas complexos

import { useState, useEffect, useCallback } from 'react'
import { Vaga } from '../types/database'
import { getVagasForceRefresh } from '../lib/vagas'
import { useSimpleCache } from '../lib/simple-cache'

interface UseSimpleVagasReturn {
  vagas: Vaga[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  lastUpdated: number
}

export function useSimpleVagas(): UseSimpleVagasReturn {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [isInitialized, setIsInitialized] = useState(false)
  
  const cache = useSimpleCache()

  // Carregar vagas
  const loadVagas = useCallback(async (forceRefresh: boolean = false) => {
    const cacheKey = 'vagas:all'
    
    try {
      setLoading(true)
      setError(null)

      // Tentar cache primeiro se não forçar refresh e já foi inicializado
      if (!forceRefresh && isInitialized) {
        const cachedVagas = cache.get<Vaga[]>(cacheKey)
        if (cachedVagas && cachedVagas.length > 0) {
          setVagas(cachedVagas)
          setLoading(false)
          console.log('📖 Vagas carregadas do cache simples')
          return
        }
      }

      console.log('🔄 Carregando vagas do servidor...')
      const freshVagas = await getVagasForceRefresh()
      
      // Validar dados recebidos
      if (!Array.isArray(freshVagas)) {
        throw new Error('Dados inválidos recebidos do servidor')
      }
      
      // Armazenar no cache apenas se houver dados válidos
      if (freshVagas.length > 0) {
        cache.set(cacheKey, freshVagas, 15 * 60 * 1000) // 15 minutos
      }
      
      setVagas(freshVagas)
      setLastUpdated(Date.now())
      setIsInitialized(true)
      
      console.log(`✅ ${freshVagas.length} vagas carregadas do servidor`)

    } catch (err) {
      console.error('❌ Erro ao carregar vagas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
      
      // Em caso de erro, tentar usar dados do cache se disponível
      if (!isInitialized) {
        const cachedVagas = cache.get<Vaga[]>(cacheKey)
        if (cachedVagas && cachedVagas.length > 0) {
          setVagas(cachedVagas)
          console.log('📖 Usando dados do cache após erro')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [cache, isInitialized])

  // Refresh manual
  const refresh = useCallback(async () => {
    console.log('🔄 Forçando refresh manual das vagas...')
    // Limpar cache antes do refresh
    cache.delete('vagas:all')
    await loadVagas(true)
  }, [loadVagas, cache])

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (!isInitialized) {
      loadVagas()
    }
  }, [isInitialized, loadVagas])

  return {
    vagas,
    loading,
    error,
    refresh,
    lastUpdated
  }
}
