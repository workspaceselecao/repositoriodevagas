export const APP_VERSION = "1.2.3"
export const BUILD_DATE = new Date().toISOString()

// Chave para armazenar a versão atual no localStorage
const VERSION_STORAGE_KEY = 'repositoriodevagas_current_version'
const LAST_CHECK_KEY = 'repositoriodevagas_last_check'

interface VersionInfo {
  version: string
  buildDate: string
  description?: string
}

// Função para obter a versão atual armazenada
export const getCurrentStoredVersion = (): string | null => {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY)
  } catch {
    return null
  }
}

// Função para armazenar a versão atual
export const setCurrentStoredVersion = (version: string): void => {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version)
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
  } catch (error) {
    console.warn('Não foi possível armazenar a versão:', error)
  }
}

// Função para buscar informações da versão do servidor
export const fetchServerVersion = async (): Promise<VersionInfo | null> => {
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = Date.now()
    const response = await fetch(`/version.json?t=${timestamp}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.version) {
      throw new Error('Versão não encontrada na resposta do servidor')
    }
    
    console.log('📦 Versão do servidor:', data.version, '| Versão local:', APP_VERSION)
    return data
  } catch (error) {
    console.error('❌ Erro ao buscar versão do servidor:', error)
    return null
  }
}

// Função para verificar se há nova versão disponível
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verificando atualizações...')
    
    // Verificar se já verificamos recentemente (evitar spam)
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)
    if (lastCheck) {
      const lastCheckTime = new Date(lastCheck).getTime()
      const now = Date.now()
      const timeDiff = now - lastCheckTime
      
      // Se verificamos há menos de 5 minutos, não verificar novamente
      if (timeDiff < 5 * 60 * 1000) {
        console.log('⏰ Verificação muito recente, pulando...')
        return false
      }
    }
    
    // Buscar versão do servidor
    const serverVersion = await fetchServerVersion()
    
    if (!serverVersion) {
      console.log('⚠️ Não foi possível obter versão do servidor')
      return false
    }
    
    // Obter versão armazenada localmente
    const storedVersion = getCurrentStoredVersion()
    
    // Se não há versão armazenada, armazenar a atual e não mostrar atualização
    if (!storedVersion) {
      console.log('📝 Primeira verificação, armazenando versão atual')
      setCurrentStoredVersion(APP_VERSION)
      return false
    }
    
    // Comparar versões - CORREÇÃO: comparar com APP_VERSION atual, não com storedVersion
    const hasUpdate = serverVersion.version !== APP_VERSION
    
    console.log('🔄 Comparação de versões:')
    console.log(`   APP_VERSION atual: ${APP_VERSION}`)
    console.log(`   Servidor: ${serverVersion.version}`)
    console.log(`   Armazenada: ${storedVersion}`)
    console.log(`   Nova versão disponível: ${hasUpdate ? '✅ SIM' : '❌ NÃO'}`)
    
    // Atualizar timestamp da última verificação
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
    
    return hasUpdate
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error)
    return false
  }
}

// Função para forçar reload da aplicação
export const forceReload = () => {
  console.log('🔄 Forçando reload da aplicação...')
  
  // Buscar a versão atual do servidor e atualizar o localStorage antes do reload
  fetchServerVersion().then(serverVersion => {
    if (serverVersion) {
      // CORREÇÃO: Atualizar para a versão do servidor, não manter a atual
      setCurrentStoredVersion(serverVersion.version)
      console.log('✅ Versão atualizada no localStorage para:', serverVersion.version)
      
      // Limpar cache do navegador para garantir que a nova versão seja carregada
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
          console.log('🗑️ Cache limpo para nova versão')
        })
      }
    }
  }).catch(error => {
    console.warn('⚠️ Não foi possível atualizar versão antes do reload:', error)
  }).finally(() => {
    // Forçar reload com cache bypass para garantir nova versão
    setTimeout(() => {
      window.location.reload() // Força reload sem cache
    }, 100)
  })
}

// Função para inicializar o sistema de versão (chamada na inicialização da app)
export const initializeVersionSystem = () => {
  try {
    const storedVersion = getCurrentStoredVersion()
    
    if (!storedVersion) {
      // Primeira vez que a aplicação é executada
      setCurrentStoredVersion(APP_VERSION)
      console.log('🚀 Sistema de versão inicializado com versão:', APP_VERSION)
    } else {
      console.log('📋 Versão armazenada:', storedVersion, '| Versão atual:', APP_VERSION)
    }
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar sistema de versão:', error)
  }
}
