import { useEffect } from 'react'

export function useCleanup() {
  useEffect(() => {
    // Removido limpeza automática de cache que causava deslogamento
    // A sessão do usuário agora persiste corretamente
    console.log('Sistema de limpeza desabilitado para preservar autenticação')
  }, [])
}
