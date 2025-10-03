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
  
  const cache = useSimpleCache()

  // Carregar vagas
  const loadVagas = useCallback(async (forceRefresh: boolean = false) => {
    const cacheKey = 'vagas:all'
    
    try {
      setLoading(true)
      setError(null)

      // Tentar cache primeiro se não forçar refresh
      if (!forceRefresh) {
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
      
      // Armazenar no cache
      cache.set(cacheKey, freshVagas, 15 * 60 * 1000) // 15 minutos
      
      setVagas(freshVagas)
      setLastUpdated(Date.now())
      
      console.log(`✅ ${freshVagas.length} vagas carregadas do servidor`)

    } catch (err) {
      console.error('❌ Erro ao carregar vagas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
    } finally {
      setLoading(false)
    }
  }, [cache])

  // Refresh manual
  const refresh = useCallback(async () => {
    await loadVagas(true)
  }, [loadVagas])

  // Carregar dados iniciais
  useEffect(() => {
    loadVagas()
  }, [loadVagas])

  return {
    vagas,
    loading,
    error,
    refresh,
    lastUpdated
  }
}
