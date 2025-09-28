// Sistema de cache distribuído para múltiplas abas
// Usa BroadcastChannel para sincronizar cache entre diferentes abas do navegador

interface CacheMessage {
  type: 'CACHE_UPDATE' | 'CACHE_REQUEST' | 'CACHE_RESPONSE' | 'CACHE_CLEAR' | 'TAB_ACTIVITY' | 'TAB_CLOSE'
  userId: string
  data?: any
  timestamp: number
  tabId: string
}

interface CacheSyncStats {
  messagesSent: number
  messagesReceived: number
  lastSyncTime: number
  activeTabs: number
}

class CacheDistributor {
  private channel: BroadcastChannel
  private tabId: string
  private userId: string | null = null
  private stats: CacheSyncStats = {
    messagesSent: 0,
    messagesReceived: 0,
    lastSyncTime: 0,
    activeTabs: 1
  }
  private listeners: Map<string, (data: any) => void> = new Map()
  private activeTabs: Set<string> = new Set()

  constructor() {
    this.tabId = this.generateTabId()
    this.channel = new BroadcastChannel('cache-sync')
    this.setupEventListeners()
    
    // Registrar esta aba como ativa
    this.broadcastTabActivity()
    
    // Verificar outras abas ativas periodicamente
    setInterval(() => this.checkActiveTabs(), 30000) // 30 segundos
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupEventListeners(): void {
    this.channel.addEventListener('message', (event: MessageEvent<CacheMessage>) => {
      this.handleMessage(event.data)
    })

    // Limpar ao fechar a aba
    window.addEventListener('beforeunload', () => {
      this.broadcastTabClose()
    })
  }

  private handleMessage(message: CacheMessage): void {
    // Ignorar mensagens da própria aba
    if (message.tabId === this.tabId) return

    this.stats.messagesReceived++
    this.stats.lastSyncTime = Date.now()

    switch (message.type) {
      case 'CACHE_UPDATE':
        if (message.userId === this.userId) {
          this.notifyListeners('cache-update', message.data)
        }
        break

      case 'CACHE_REQUEST':
        if (message.userId === this.userId) {
          this.notifyListeners('cache-request', message)
        }
        break

      case 'CACHE_RESPONSE':
        if (message.userId === this.userId) {
          this.notifyListeners('cache-response', message.data)
        }
        break

      case 'CACHE_CLEAR':
        if (message.userId === this.userId) {
          this.notifyListeners('cache-clear', message.data)
        }
        break

      case 'TAB_ACTIVITY':
        this.activeTabs.add(message.tabId)
        this.stats.activeTabs = this.activeTabs.size
        break

      case 'TAB_CLOSE':
        this.activeTabs.delete(message.tabId)
        this.stats.activeTabs = this.activeTabs.size
        break
    }
  }

  private notifyListeners(event: string, data: any): void {
    const listener = this.listeners.get(event)
    if (listener) {
      listener(data)
    }
  }

  private broadcastMessage(type: CacheMessage['type'], data?: any): void {
    if (!this.userId) return

    const message: CacheMessage = {
      type,
      userId: this.userId,
      data,
      timestamp: Date.now(),
      tabId: this.tabId
    }

    this.channel.postMessage(message)
    this.stats.messagesSent++
  }

  private broadcastTabActivity(): void {
    this.broadcastMessage('TAB_ACTIVITY')
  }

  private broadcastTabClose(): void {
    this.broadcastMessage('TAB_CLOSE')
  }

  private checkActiveTabs(): void {
    // Remover tabs que não responderam recentemente
    const now = Date.now()
    const timeout = 60000 // 1 minuto
    
    // Esta é uma implementação simplificada
    // Em produção, você poderia implementar um sistema de heartbeat mais robusto
  }

  // Métodos públicos
  setUserId(userId: string): void {
    this.userId = userId
    this.broadcastTabActivity()
  }

  broadcastCacheUpdate(cacheData: any): void {
    this.broadcastMessage('CACHE_UPDATE', cacheData)
  }

  requestCacheSync(): void {
    this.broadcastMessage('CACHE_REQUEST')
  }

  respondToCacheRequest(cacheData: any): void {
    this.broadcastMessage('CACHE_RESPONSE', cacheData)
  }

  broadcastCacheClear(): void {
    this.broadcastMessage('CACHE_CLEAR')
  }

  onCacheUpdate(callback: (data: any) => void): () => void {
    this.listeners.set('cache-update', callback)
    return () => this.listeners.delete('cache-update')
  }

  onCacheRequest(callback: (message: CacheMessage) => void): () => void {
    this.listeners.set('cache-request', callback)
    return () => this.listeners.delete('cache-request')
  }

  onCacheResponse(callback: (data: any) => void): () => void {
    this.listeners.set('cache-response', callback)
    return () => this.listeners.delete('cache-response')
  }

  onCacheClear(callback: (data: any) => void): () => void {
    this.listeners.set('cache-clear', callback)
    return () => this.listeners.delete('cache-clear')
  }

  getStats(): CacheSyncStats {
    return { ...this.stats }
  }

  getActiveTabsCount(): number {
    return this.activeTabs.size
  }

  destroy(): void {
    this.broadcastTabClose()
    this.channel.close()
    this.listeners.clear()
  }
}

// Singleton para o distribuidor de cache
let cacheDistributor: CacheDistributor | null = null

export function getCacheDistributor(): CacheDistributor {
  if (!cacheDistributor) {
    cacheDistributor = new CacheDistributor()
  }
  return cacheDistributor
}

export function destroyCacheDistributor(): void {
  if (cacheDistributor) {
    cacheDistributor.destroy()
    cacheDistributor = null
  }
}

// Hook para usar o cache distribuído
export function useCacheDistributor() {
  const distributor = getCacheDistributor()
  
  return {
    setUserId: distributor.setUserId.bind(distributor),
    broadcastCacheUpdate: distributor.broadcastCacheUpdate.bind(distributor),
    requestCacheSync: distributor.requestCacheSync.bind(distributor),
    respondToCacheRequest: distributor.respondToCacheRequest.bind(distributor),
    broadcastCacheClear: distributor.broadcastCacheClear.bind(distributor),
    onCacheUpdate: distributor.onCacheUpdate.bind(distributor),
    onCacheRequest: distributor.onCacheRequest.bind(distributor),
    onCacheResponse: distributor.onCacheResponse.bind(distributor),
    onCacheClear: distributor.onCacheClear.bind(distributor),
    getStats: distributor.getStats.bind(distributor),
    getActiveTabsCount: distributor.getActiveTabsCount.bind(distributor)
  }
}
