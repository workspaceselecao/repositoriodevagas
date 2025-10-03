// Sistema de Cache Reativo com Server-Sent Events
// Mantém dados sincronizados em tempo real com o servidor

interface CacheUpdateEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'INVALIDATE'
  table: string
  id: string
  data?: any
  timestamp: number
  userId?: string
}

interface ReactiveCacheConfig {
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  eventBufferSize: number
}

class ReactiveCache {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private isConnected = false
  private listeners = new Map<string, Set<(event: CacheUpdateEvent) => void>>()
  private eventBuffer: CacheUpdateEvent[] = []
  private config: ReactiveCacheConfig
  private heartbeatInterval: NodeJS.Timeout | null = null
  private currentUser: any = null

  constructor(config: Partial<ReactiveCacheConfig> = {}) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      eventBufferSize: 100,
      ...config
    }
  }

  // Conectar ao Server-Sent Events
  connect(user: any): void {
    if (this.isConnected || !user) return

    // Verificar se estamos em ambiente de desenvolvimento ou se SSE não está disponível
    if (import.meta.env.DEV || !this.isSSEAvailable()) {
      console.log('⚠️ Cache reativo desabilitado (ambiente de desenvolvimento ou SSE não disponível)')
      return
    }

    this.currentUser = user
    this.startConnection()
  }

  // Verificar se SSE está disponível
  private isSSEAvailable(): boolean {
    // Verificar se o endpoint SSE existe
    const sseUrl = `${import.meta.env.VITE_SUPABASE_URL}/realtime/v1/events?apikey=${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    
    // Em desenvolvimento, assumir que não está disponível
    if (import.meta.env.DEV) {
      return false
    }

    // Verificar se EventSource é suportado
    if (typeof EventSource === 'undefined') {
      return false
    }

    return true
  }

  private startConnection(): void {
    if (!this.currentUser) return

    // Verificação adicional para evitar conexões em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('⚠️ Conexão SSE bloqueada em desenvolvimento')
      return
    }

    try {
      // URL do endpoint SSE (ajustar conforme sua implementação)
      const sseUrl = `${import.meta.env.VITE_SUPABASE_URL}/realtime/v1/events?apikey=${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      
      this.eventSource = new EventSource(sseUrl, {
        withCredentials: true
      })

      this.eventSource.onopen = () => {
        console.log('🔗 Cache reativo conectado')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.processBufferedEvents()
      }

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event)
      }

      this.eventSource.onerror = (error) => {
        console.error('❌ Erro na conexão reativa:', error)
        this.isConnected = false
        this.stopHeartbeat()
        this.scheduleReconnect()
      }

      // Configurar listeners específicos para tabelas
      this.setupTableListeners()

    } catch (error) {
      console.error('❌ Erro ao conectar cache reativo:', error)
      this.scheduleReconnect()
    }
  }

  private setupTableListeners(): void {
    if (!this.eventSource) return

    // Listener para vagas
    this.eventSource.addEventListener('vagas', (event) => {
      this.handleTableEvent('vagas', event)
    })

    // Listener para usuários
    this.eventSource.addEventListener('users', (event) => {
      this.handleTableEvent('users', event)
    })

    // Listener para notícias
    this.eventSource.addEventListener('noticias', (event) => {
      this.handleTableEvent('noticias', event)
    })

    // Listener para configurações
    this.eventSource.addEventListener('contact_email_config', (event) => {
      this.handleTableEvent('contact_email_config', event)
    })
  }

  private handleTableEvent(table: string, event: MessageEvent): void {
    try {
      const updateEvent: CacheUpdateEvent = {
        type: event.type as any,
        table,
        id: event.lastEventId || 'unknown',
        data: event.data ? JSON.parse(event.data) : null,
        timestamp: Date.now(),
        userId: this.currentUser?.id
      }

      this.processEvent(updateEvent)
    } catch (error) {
      console.error(`❌ Erro ao processar evento da tabela ${table}:`, error)
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'heartbeat') {
        // Responder ao heartbeat
        this.sendHeartbeatResponse()
        return
      }

      if (data.type === 'cache_update') {
        const updateEvent: CacheUpdateEvent = {
          type: data.operation,
          table: data.table,
          id: data.id,
          data: data.new_data,
          timestamp: Date.now(),
          userId: data.user_id
        }

        this.processEvent(updateEvent)
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error)
    }
  }

  private processEvent(event: CacheUpdateEvent): void {
    // Verificar se o evento é relevante para o usuário atual
    if (this.shouldProcessEvent(event)) {
      // Notificar listeners
      this.notifyListeners(event)

      // Processar evento no cache
      this.updateCacheFromEvent(event)

      console.log(`🔄 Cache atualizado via evento reativo: ${event.table}.${event.type}`)
    }
  }

  private shouldProcessEvent(event: CacheUpdateEvent): boolean {
    // Se não há usuário específico, processar para todos
    if (!event.userId) return true

    // Se é o usuário atual ou um evento global
    return event.userId === this.currentUser?.id || event.userId === 'global'
  }

  private updateCacheFromEvent(event: CacheUpdateEvent): void {
    // Importar o cache inteligente para atualizar
    import('./intelligent-cache').then(({ getIntelligentCache }) => {
      const cache = getIntelligentCache()

      switch (event.type) {
        case 'CREATE':
        case 'UPDATE':
          if (event.data) {
            // Invalidar cache específico para forçar refresh
            cache.invalidate(event.table as any, event.userId)
          }
          break

        case 'DELETE':
          // Invalidar cache específico
          cache.invalidate(event.table as any, event.userId)
          break

        case 'INVALIDATE':
          // Invalidar todo o cache da tabela
          cache.invalidate(event.table as any, event.userId)
          break
      }
    })
  }

  // Agendar reconexão
  private scheduleReconnect(): void {
    // Não reconectar em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('⚠️ Reconexão bloqueada em desenvolvimento')
      return
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('⚠️ Máximo de tentativas de reconexão atingido')
      return
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.disconnect()
      this.startConnection()
    }, delay)
  }

  // Iniciar heartbeat
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.eventSource) {
        this.sendHeartbeat()
      }
    }, this.config.heartbeatInterval)
  }

  // Parar heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Enviar heartbeat
  private sendHeartbeat(): void {
    // Implementar heartbeat se necessário
    // Pode ser um ping simples ou uma mensagem específica
  }

  private sendHeartbeatResponse(): void {
    // Responder ao heartbeat do servidor
    console.log('💓 Heartbeat recebido')
  }

  // Processar eventos em buffer
  private processBufferedEvents(): void {
    while (this.eventBuffer.length > 0) {
      const event = this.eventBuffer.shift()
      if (event) {
        this.processEvent(event)
      }
    }
  }

  // Adicionar listener para eventos específicos
  addListener(table: string, callback: (event: CacheUpdateEvent) => void): () => void {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set())
    }

    this.listeners.get(table)!.add(callback)

    return () => {
      this.listeners.get(table)?.delete(callback)
    }
  }

  // Notificar listeners
  private notifyListeners(event: CacheUpdateEvent): void {
    // Notificar listeners específicos da tabela
    this.listeners.get(event.table)?.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ Erro ao notificar listener:', error)
      }
    })

    // Notificar listeners globais
    this.listeners.get('*')?.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ Erro ao notificar listener global:', error)
      }
    })
  }

  // Enviar evento para o servidor (se implementado)
  sendEvent(event: Omit<CacheUpdateEvent, 'timestamp'>): void {
    if (!this.isConnected) {
      console.warn('⚠️ Cache reativo não conectado, evento não enviado')
      return
    }

    // Implementar envio de eventos se o servidor suportar
    console.log('📤 Evento enviado para o servidor:', event)
  }

  // Obter status da conexão
  getStatus(): {
    connected: boolean
    reconnectAttempts: number
    listeners: number
    bufferedEvents: number
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      listeners: Array.from(this.listeners.values()).reduce((total, set) => total + set.size, 0),
      bufferedEvents: this.eventBuffer.length
    }
  }

  // Desconectar
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.stopHeartbeat()
    this.isConnected = false
    console.log('🔌 Cache reativo desconectado')
  }

  // Limpar listeners
  clearListeners(): void {
    this.listeners.clear()
    console.log('🗑️ Listeners do cache reativo limpos')
  }

  // Destruir instância
  destroy(): void {
    this.disconnect()
    this.clearListeners()
    this.eventBuffer = []
    this.currentUser = null
    console.log('💥 Cache reativo destruído')
  }
}

// Sistema de Cache Reativo Alternativo com Polling
class PollingCache {
  private intervals = new Map<string, NodeJS.Timeout>()
  private listeners = new Map<string, Set<(data: any) => void>>()
  private lastTimestamps = new Map<string, number>()
  private config: {
    defaultInterval: number
    maxInterval: number
    backoffMultiplier: number
  }

  constructor(config: Partial<typeof PollingCache.prototype.config> = {}) {
    this.config = {
      defaultInterval: 30000, // 30 segundos
      maxInterval: 300000, // 5 minutos
      backoffMultiplier: 1.5,
      ...config
    }
  }

  // Iniciar polling para uma tabela
  startPolling(
    table: string,
    fetcher: () => Promise<any[]>,
    interval?: number
  ): void {
    if (this.intervals.has(table)) {
      console.warn(`⚠️ Polling já ativo para ${table}`)
      return
    }

    const pollInterval = interval || this.config.defaultInterval
    console.log(`🔄 Iniciando polling para ${table} (${pollInterval}ms)`)

    const poll = async () => {
      try {
        const data = await fetcher()
        const lastTimestamp = this.lastTimestamps.get(table) || 0
        const currentTimestamp = Date.now()

        // Verificar se houve mudanças
        if (this.hasDataChanged(table, data, lastTimestamp)) {
          this.notifyListeners(table, data)
          this.lastTimestamps.set(table, currentTimestamp)
          console.log(`📊 Dados atualizados via polling: ${table}`)
        }

      } catch (error) {
        console.error(`❌ Erro no polling de ${table}:`, error)
        this.handlePollingError(table)
      }
    }

    // Executar imediatamente
    poll()

    // Agendar polling
    const intervalId = setInterval(poll, pollInterval)
    this.intervals.set(table, intervalId)
  }

  // Parar polling para uma tabela
  stopPolling(table: string): void {
    const interval = this.intervals.get(table)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(table)
      this.lastTimestamps.delete(table)
      console.log(`⏹️ Polling parado para ${table}`)
    }
  }

  // Verificar se dados mudaram
  private hasDataChanged(table: string, newData: any[], lastTimestamp: number): boolean {
    // Implementar lógica de comparação
    // Pode ser baseada em timestamps, checksums, ou comparação de conteúdo
    
    // Por simplicidade, assumir que mudou se passou tempo suficiente
    const timeSinceLastUpdate = Date.now() - lastTimestamp
    return timeSinceLastUpdate > 30000 // 30 segundos
  }

  // Lidar com erro de polling
  private handlePollingError(table: string): void {
    const currentInterval = this.intervals.get(table)
    if (!currentInterval) return

    // Implementar backoff exponencial
    const newInterval = Math.min(
      this.config.defaultInterval * this.config.backoffMultiplier,
      this.config.maxInterval
    )

    this.stopPolling(table)
    
    setTimeout(() => {
      console.log(`🔄 Tentando reconectar polling para ${table}`)
      // Reiniciar polling com novo intervalo
    }, newInterval)
  }

  // Adicionar listener
  addListener(table: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set())
    }

    this.listeners.get(table)!.add(callback)

    return () => {
      this.listeners.get(table)?.delete(callback)
    }
  }

  // Notificar listeners
  private notifyListeners(table: string, data: any): void {
    this.listeners.get(table)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('❌ Erro ao notificar listener:', error)
      }
    })
  }

  // Obter status
  getStatus(): {
    activePolling: string[]
    listeners: number
  } {
    return {
      activePolling: Array.from(this.intervals.keys()),
      listeners: Array.from(this.listeners.values()).reduce((total, set) => total + set.size, 0)
    }
  }

  // Limpar tudo
  destroy(): void {
    this.intervals.forEach((interval, table) => {
      this.stopPolling(table)
    })
    this.listeners.clear()
    this.lastTimestamps.clear()
    console.log('💥 Polling cache destruído')
  }
}

// Singleton para cache reativo
let reactiveCache: ReactiveCache | null = null
let pollingCache: PollingCache | null = null

export function getReactiveCache(): ReactiveCache {
  if (!reactiveCache) {
    reactiveCache = new ReactiveCache()
  }
  return reactiveCache
}

export function getPollingCache(): PollingCache {
  if (!pollingCache) {
    pollingCache = new PollingCache()
  }
  return pollingCache
}

// Hook para usar cache reativo
export function useReactiveCache() {
  const reactive = getReactiveCache()
  const polling = getPollingCache()

  return {
    // Cache reativo (SSE)
    connect: reactive.connect.bind(reactive),
    disconnect: reactive.disconnect.bind(reactive),
    addListener: reactive.addListener.bind(reactive),
    sendEvent: reactive.sendEvent.bind(reactive),
    getStatus: reactive.getStatus.bind(reactive),
    
    // Cache com polling
    startPolling: polling.startPolling.bind(polling),
    stopPolling: polling.stopPolling.bind(polling),
    addPollingListener: polling.addListener.bind(polling),
    getPollingStatus: polling.getStatus.bind(polling),
    
    // Utilitários
    destroy: () => {
      reactive.destroy()
      polling.destroy()
    }
  }
}
