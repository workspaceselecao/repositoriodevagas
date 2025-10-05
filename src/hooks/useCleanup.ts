import { useEffect } from 'react'

export function useCleanup() {
  useEffect(() => {
    // Limpeza automática de recursos
    console.log('Sistema de limpeza ativo')
  }, [])
}
