import { useState, useEffect } from 'react'
import { SystemConfig, getSystemConfig, getAllSystemConfigs, updateSystemConfig, isRHNovaVagaEnabled, setRHNovaVagaAccess, isRHEditEnabled, setRHEditAccess, isRHDeleteEnabled, setRHDeleteAccess } from '../lib/systemConfig'

export function useSystemConfig() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadConfigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllSystemConfigs()
      setConfigs(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    try {
      const success = await updateSystemConfig(key, value)
      if (success) {
        await loadConfigs() // Recarregar configurações
      }
      return success
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const getConfigValue = (key: string): string | null => {
    const config = configs.find(c => c.config_key === key)
    return config?.config_value || null
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  return {
    configs,
    loading,
    error,
    loadConfigs,
    updateConfig,
    getConfigValue
  }
}

export function useRHNovaVagaAccess() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAccessStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const enabled = await isRHNovaVagaEnabled()
      setIsEnabled(enabled)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAccess = async (enabled: boolean) => {
    try {
      const success = await setRHNovaVagaAccess(enabled)
      if (success) {
        setIsEnabled(enabled)
      }
      return success
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao alternar acesso RH Nova Vaga:', err)
      return false
    }
  }

  useEffect(() => {
    loadAccessStatus()
  }, [])

  return {
    isEnabled,
    loading,
    error,
    toggleAccess,
    loadAccessStatus
  }
}

export function useRHEditAccess() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAccessStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const enabled = await isRHEditEnabled()
      setIsEnabled(enabled)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAccess = async (enabled: boolean) => {
    try {
      const success = await setRHEditAccess(enabled)
      if (success) {
        setIsEnabled(enabled)
      }
      return success
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao alternar acesso RH Edit:', err)
      return false
    }
  }

  useEffect(() => {
    loadAccessStatus()
  }, [])

  return {
    isEnabled,
    loading,
    error,
    toggleAccess,
    loadAccessStatus
  }
}

export function useRHDeleteAccess() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAccessStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const enabled = await isRHDeleteEnabled()
      setIsEnabled(enabled)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAccess = async (enabled: boolean) => {
    try {
      const success = await setRHDeleteAccess(enabled)
      if (success) {
        setIsEnabled(enabled)
      }
      return success
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao alternar acesso RH Delete:', err)
      return false
    }
  }

  useEffect(() => {
    loadAccessStatus()
  }, [])

  return {
    isEnabled,
    loading,
    error,
    toggleAccess,
    loadAccessStatus
  }
}
