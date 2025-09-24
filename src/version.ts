export const APP_VERSION = "1.0.1"

// Função para verificar se há nova versão disponível
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // Tentar buscar a versão atual do servidor
    const response = await fetch('/version.json', { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.version !== APP_VERSION
    }
    
    return false
  } catch (error) {
    console.log('Não foi possível verificar atualizações:', error)
    return false
  }
}

// Função para forçar reload da aplicação
export const forceReload = () => {
  console.log('🔄 Forçando reload da aplicação...')
  window.location.reload()
}
