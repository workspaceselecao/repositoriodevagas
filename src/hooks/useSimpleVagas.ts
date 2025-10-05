// Hook Simplificado para Vagas - Modo Desenvolvimento

import { useState, useEffect, useCallback } from 'react'
import { Vaga } from '../types/database'
import { getVagasForceRefresh } from '../lib/vagas'

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
  

  // Carregar vagas
  const loadVagas = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Carregando vagas do servidor...')
      const freshVagas = await getVagasForceRefresh()
      
      // Validar dados recebidos
      if (!Array.isArray(freshVagas)) {
        throw new Error('Dados inválidos recebidos do servidor')
      }
      
      
      setVagas(freshVagas)
      setLastUpdated(Date.now())
      setIsInitialized(true)
      
      console.log(`✅ ${freshVagas.length} vagas carregadas do servidor`)

    } catch (err) {
      console.error('❌ Erro ao carregar vagas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
      
    } finally {
      setLoading(false)
    }
  }, [isInitialized])

  // Refresh manual
  const refresh = useCallback(async () => {
    console.log('🔄 Forçando refresh manual das vagas...')
    await loadVagas(true)
  }, [loadVagas])

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
