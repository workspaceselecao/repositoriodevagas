import { useEffect } from 'react'

export function useCleanup() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Limpar cache quando a aplicação for fechada
      const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
      
      if (supabaseProjectId) {
        // Limpar tokens do localStorage
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`)
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token-code-verifier`)
        
        // Limpar dados específicos da aplicação
        localStorage.removeItem('theme')
        localStorage.removeItem('sidebar-collapsed')
      }
      
      // Limpar sessionStorage
      sessionStorage.clear()
      
      console.log('Cache limpo antes de fechar a aplicação')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Aplicação foi minimizada ou fechada
        console.log('Aplicação minimizada/fechada - preparando limpeza')
      }
    }

    // Adicionar listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
