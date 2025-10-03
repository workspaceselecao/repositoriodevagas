// Sistema de Cache de Sessão Otimizado
// Mantém a sessão do usuário localmente para evitar deslogamentos desnecessários

interface SessionData {
  user: any
  access_token: string
  refresh_token: string
  expires_at: number
  created_at: number
}

class SessionCache {
  private static instance: SessionCache
  private readonly SESSION_KEY = 'sb-mywaoaofatgwbbtyqfpd-auth-token'
  private readonly BACKUP_KEY = 'repovagas-session-backup'
  private readonly MAX_AGE = 24 * 60 * 60 * 1000 // 24 horas

  static getInstance(): SessionCache {
    if (!SessionCache.instance) {
      SessionCache.instance = new SessionCache()
    }
    return SessionCache.instance
  }

  // Salvar sessão
  saveSession(sessionData: SessionData): void {
    try {
      const session = {
        ...sessionData,
        created_at: Date.now(),
        expires_at: sessionData.expires_at || (Date.now() + this.MAX_AGE)
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(session))
      
      console.log('💾 Sessão salva no cache local')
    } catch (error) {
      console.warn('⚠️ Erro ao salvar sessão no cache:', error)
    }
  }

  // Recuperar sessão
  getSession(): SessionData | null {
    try {
      // Tentar chave principal primeiro
      let sessionData = this.getSessionFromKey(this.SESSION_KEY)
      
      // Se não encontrar, tentar backup
      if (!sessionData) {
        sessionData = this.getSessionFromKey(this.BACKUP_KEY)
      }

      if (sessionData) {
        // Verificar se não expirou
        if (this.isSessionValid(sessionData)) {
          console.log('✅ Sessão válida encontrada no cache')
          return sessionData
        } else {
          console.log('⏰ Sessão expirada, removendo do cache')
          this.clearSession()
        }
      }

      return null
    } catch (error) {
      console.warn('⚠️ Erro ao recuperar sessão do cache:', error)
      return null
    }
  }

  // Verificar se sessão é válida
  isSessionValid(sessionData: SessionData): boolean {
    if (!sessionData) return false
    
    const now = Date.now()
    const expiresAt = sessionData.expires_at || (sessionData.created_at + this.MAX_AGE)
    
    return now < expiresAt
  }

  // Limpar sessão
  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY)
      localStorage.removeItem(this.BACKUP_KEY)
      console.log('🗑️ Sessão removida do cache')
    } catch (error) {
      console.warn('⚠️ Erro ao limpar sessão do cache:', error)
    }
  }

  // Verificar se há sessão válida
  hasValidSession(): boolean {
    const session = this.getSession()
    return session !== null && this.isSessionValid(session)
  }

  // Obter dados da sessão de uma chave específica
  private getSessionFromKey(key: string): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(key)
      if (!sessionStr) return null
      
      return JSON.parse(sessionStr) as SessionData
    } catch (error) {
      console.warn(`⚠️ Erro ao parsear sessão da chave ${key}:`, error)
      return null
    }
  }

  // Atualizar apenas o token de acesso
  updateAccessToken(newToken: string): void {
    try {
      const session = this.getSession()
      if (session) {
        session.access_token = newToken
        this.saveSession(session)
        console.log('🔄 Token de acesso atualizado no cache')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar token de acesso:', error)
    }
  }

  // Obter estatísticas do cache
  getStats(): { hasSession: boolean; isValid: boolean; expiresAt?: number } {
    const session = this.getSession()
    return {
      hasSession: session !== null,
      isValid: session !== null && this.isSessionValid(session),
      expiresAt: session?.expires_at
    }
  }
}

// Singleton export
export const sessionCache = SessionCache.getInstance()

// Hook para usar o cache de sessão
export function useSessionCache() {
  return {
    saveSession: sessionCache.saveSession.bind(sessionCache),
    getSession: sessionCache.getSession.bind(sessionCache),
    clearSession: sessionCache.clearSession.bind(sessionCache),
    hasValidSession: sessionCache.hasValidSession.bind(sessionCache),
    updateAccessToken: sessionCache.updateAccessToken.bind(sessionCache),
    getStats: sessionCache.getStats.bind(sessionCache)
  }
}