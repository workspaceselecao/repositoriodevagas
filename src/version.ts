export const APP_VERSION = "1.4.0"
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

// Função para buscar informações da versão do servidor (versão menos agressiva)
export const fetchServerVersion = async (): Promise<VersionInfo | null> => {
  try {
    // Adicionar timestamp aleatório para evitar cache
    const timestamp = Date.now() + Math.random()
    
    // CORREÇÃO: Não limpar cache antes da requisição para evitar invisibilidade
    console.log('🔍 Buscando versão do servidor...')
    
    const response = await fetch(`/version.json?t=${timestamp}&r=${Math.random()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString()
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

// Função para forçar reload da aplicação (versão mais robusta)
export const forceReload = () => {
  console.log('🔄 Forçando reload da aplicação...')
  
  // CORREÇÃO CRÍTICA: Verificar se já estamos em processo de reload para evitar loops
  const reloadKey = 'app-reload-in-progress'
  const reloadStartTime = Date.now()
  
  if (sessionStorage.getItem(reloadKey)) {
    console.warn('⚠️ Reload já em andamento, evitando loop infinito')
    return
  }
  
  // Marcar que reload está em andamento
  sessionStorage.setItem(reloadKey, reloadStartTime.toString())
  
  // CORREÇÃO: Sempre atualizar para a versão mais recente disponível
  fetchServerVersion().then(serverVersion => {
    if (serverVersion) {
      // Atualizar para a versão do servidor (mais recente)
      setCurrentStoredVersion(serverVersion.version)
      console.log('✅ Versão atualizada no localStorage para:', serverVersion.version)
    } else {
      // Se não conseguir buscar do servidor, usar APP_VERSION
      setCurrentStoredVersion(APP_VERSION)
      console.log('✅ Usando APP_VERSION como fallback:', APP_VERSION)
    }
    
    // CORREÇÃO CRÍTICA: Reload imediato sem limpeza de cache para evitar desaparecimento
    console.log('🔄 Executando reload imediato sem limpeza de cache...')
    
    // CORREÇÃO: Usar location.replace em vez de reload para evitar problemas
    setTimeout(() => {
      console.log('🔄 Executando location.replace...')
      window.location.replace(window.location.href)
    }, 50)
    
  }).catch(error => {
    console.warn('⚠️ Erro ao buscar versão, usando APP_VERSION:', error)
    setCurrentStoredVersion(APP_VERSION)
    
    // CORREÇÃO: Reload imediato mesmo com erro
    setTimeout(() => {
      console.log('🔄 Reload imediato devido a erro...')
      window.location.replace(window.location.href)
    }, 50)
  })
  
  // CORREÇÃO: Limpar flag de reload após 10 segundos para evitar bloqueio permanente
  setTimeout(() => {
    sessionStorage.removeItem(reloadKey)
    console.log('🧹 Flag de reload removida')
  }, 10000)
}

// Função para inicializar o sistema de versão (chamada na inicialização da app)
export const initializeVersionSystem = () => {
  try {
    // CORREÇÃO CRÍTICA: Limpar flags de reload que podem estar causando problemas
    sessionStorage.removeItem('app-reload-in-progress')
    sessionStorage.removeItem('refresh-button-reload')
    console.log('🧹 Flags de reload limpos na inicialização')
    
    const storedVersion = getCurrentStoredVersion()
    
    if (!storedVersion) {
      // Primeira vez que a aplicação é executada
      setCurrentStoredVersion(APP_VERSION)
      console.log('🚀 Sistema de versão inicializado com versão:', APP_VERSION)
    } else {
      console.log('📋 Versão armazenada:', storedVersion, '| Versão atual:', APP_VERSION)
      
      // CORREÇÃO: Se há discrepância significativa de versão, atualizar automaticamente
      if (storedVersion !== APP_VERSION) {
        console.log('🔄 Discrepância de versão detectada, atualizando...')
        setCurrentStoredVersion(APP_VERSION)
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar sistema de versão:', error)
  }
}
