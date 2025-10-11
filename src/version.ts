export const APP_VERSION = "1.5.0"
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

// SOLUÇÃO DEFINITIVA: Verificação simplificada que NÃO causa loops
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    console.log('🔍 SOLUÇÃO DEFINITIVA: Verificação segura de atualizações')
    
    // SEMPRE retornar false para evitar loops infinitos
    // O sistema de atualização automática foi desabilitado
    console.log('🚫 Sistema de atualização automática DESABILITADO para evitar loops infinitos')
    
    return false
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error)
    return false
  }
}

// SOLUÇÃO DEFINITIVA: Função que NÃO causa loops infinitos
export const forceReload = () => {
  console.log('🔄 SOLUÇÃO DEFINITIVA: Reload seguro sem loops infinitos')
  
  // SIMPLES: Apenas atualizar a versão armazenada e recarregar UMA VEZ
  setCurrentStoredVersion(APP_VERSION)
  
  // Reload simples e direto - sem verificações complexas
  console.log('🔄 Executando reload seguro...')
  window.location.replace(window.location.href)
}

// SOLUÇÃO DEFINITIVA: Inicialização simplificada sem verificações complexas
export const initializeVersionSystem = () => {
  try {
    console.log('🚀 SOLUÇÃO DEFINITIVA: Sistema de versão simplificado')
    
    // Apenas definir a versão atual se não existir
    const storedVersion = getCurrentStoredVersion()
    
    if (!storedVersion) {
      setCurrentStoredVersion(APP_VERSION)
      console.log('📝 Versão inicial definida:', APP_VERSION)
    } else {
      console.log('📋 Versão já existe:', storedVersion)
    }
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar sistema de versão:', error)
  }
}
