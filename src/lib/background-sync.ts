// Sistema de Background Sync para Operações Offline
// Sincroniza dados quando a conexão é restaurada

interface SyncOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  userId: string
}

interface SyncConfig {
  maxRetries: number
  retryDelay: number
  batchSize: number
  syncInterval: number
  offlineTimeout: number
}

interface SyncStats {
  totalOperations: number
  pendingOperations: number
  completedOperations: number
  failedOperations: number
  lastSyncTime: number
  isOnline: boolean
}

class BackgroundSync {
  private operations = new Map<string, SyncOperation>()
  private config: SyncConfig
  private isOnline = navigator.onLine
  private isProcessing = false
  private syncInterval: NodeJS.Timeout | null = null
  private listeners = new Set<(stats: SyncStats) => void>()
  private currentUser: any = null
  private db: IDBDatabase | null = null

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 10,
      syncInterval: 30000, // 30 segundos
      offlineTimeout: 60000, // 1 minuto
      ...config
    }

    this.initializeIndexedDB()
    this.setupOnlineStatusListener()
    this.startPeriodicSync()
  }

  // Inicializar IndexedDB para armazenar operações offline
  private async initializeIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const request = indexedDB.open('BackgroundSyncDB', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('sync_operations')) {
          const store = db.createObjectStore('sync_operations', { keyPath: 'id' })
          store.createIndex('status', 'status')
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('userId', 'userId')
          store.createIndex('priority', 'priority')
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        this.loadPendingOperations()
        console.log('✅ Background Sync DB inicializado')
      }

      request.onerror = () => {
        console.warn('⚠️ Falha ao inicializar Background Sync DB')
      }
    } catch (error) {
      console.warn('⚠️ IndexedDB não suportado para Background Sync')
    }
  }

  // Configurar listener de status online
  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🌐 Conexão restaurada - iniciando sincronização')
      this.processPendingOperations()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📴 Modo offline - operações serão enfileiradas')
    })
  }

  // Carregar operações pendentes do IndexedDB
  private async loadPendingOperations(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['sync_operations'], 'readonly')
      const store = transaction.objectStore('sync_operations')
      const index = store.index('status')
      const request = index.getAll('pending')

      request.onsuccess = () => {
        const operations = request.result as SyncOperation[]
        
        operations.forEach(op => {
          this.operations.set(op.id, op)
        })

        console.log(`📥 ${operations.length} operações pendentes carregadas`)
        resolve()
      }

      request.onerror = () => resolve()
    })
  }

  // Adicionar operação à fila de sincronização
  async addOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    data: any,
    options: {
      priority?: 'high' | 'medium' | 'low'
      userId?: string
    } = {}
  ): Promise<string> {
    if (!this.currentUser && !options.userId) {
      throw new Error('Usuário não definido')
    }

    const operation: SyncOperation = {
      id: this.generateOperationId(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority: options.priority || 'medium',
      status: 'pending',
      userId: options.userId || this.currentUser.id
    }

    // Armazenar na memória
    this.operations.set(operation.id, operation)

    // Armazenar no IndexedDB
    if (this.db) {
      await this.saveOperationToDB(operation)
    }

    console.log(`➕ Operação adicionada à fila: ${type} ${table}`)

    // Se online, processar imediatamente
    if (this.isOnline) {
      this.processPendingOperations()
    }

    this.notifyListeners()
    return operation.id
  }

  // Salvar operação no IndexedDB
  private async saveOperationToDB(operation: SyncOperation): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_operations'], 'readwrite')
      const store = transaction.objectStore('sync_operations')
      const request = store.put(operation)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Remover operação do IndexedDB
  private async removeOperationFromDB(operationId: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_operations'], 'readwrite')
      const store = transaction.objectStore('sync_operations')
      const request = store.delete(operationId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Processar operações pendentes
  async processPendingOperations(): Promise<void> {
    if (!this.isOnline || this.isProcessing) return

    this.isProcessing = true
    console.log('🔄 Processando operações pendentes...')

    try {
      // Obter operações pendentes ordenadas por prioridade
      const pendingOps = Array.from(this.operations.values())
        .filter(op => op.status === 'pending')
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })

      if (pendingOps.length === 0) {
        console.log('✅ Nenhuma operação pendente')
        this.isProcessing = false
        return
      }

      // Processar em lotes
      const batches = this.chunkArray(pendingOps, this.config.batchSize)
      
      for (const batch of batches) {
        await this.processBatch(batch)
      }

      console.log('✅ Operações pendentes processadas')
      
    } catch (error) {
      console.error('❌ Erro ao processar operações pendentes:', error instanceof Error ? error.message : error)
    } finally {
      this.isProcessing = false
      this.notifyListeners()
    }
  }

  // Processar lote de operações
  private async processBatch(operations: SyncOperation[]): Promise<void> {
    const promises = operations.map(op => this.processOperation(op))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('❌ Erro ao processar lote:', error)
    }
  }

  // Processar operação individual
  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      operation.status = 'processing'
      
      // Simular chamada para API (substituir por chamadas reais)
      const result = await this.executeOperation(operation)
      
      operation.status = 'completed'
      this.operations.delete(operation.id)
      
      // Remover do IndexedDB
      if (this.db) {
        await this.removeOperationFromDB(operation.id)
      }

      console.log(`✅ Operação ${operation.type} ${operation.table} concluída`)

    } catch (error) {
      operation.retryCount++
      operation.error = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed'
        console.error(`❌ Operação ${operation.type} ${operation.table} falhou após ${operation.maxRetries} tentativas`)
      } else {
        operation.status = 'pending'
        console.warn(`⚠️ Operação ${operation.type} ${operation.table} falhou, tentativa ${operation.retryCount}/${operation.maxRetries}`)
        
        // Agendar nova tentativa
        setTimeout(() => {
          this.processPendingOperations()
        }, this.config.retryDelay * operation.retryCount)
      }
    }
  }

  // Executar operação (implementar com suas APIs reais)
  private async executeOperation(operation: SyncOperation): Promise<any> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Aqui você implementaria as chamadas reais para sua API
    switch (operation.type) {
      case 'CREATE':
        return this.createRecord(operation.table, operation.data)
      
      case 'UPDATE':
        return this.updateRecord(operation.table, operation.data)
      
      case 'DELETE':
        return this.deleteRecord(operation.table, operation.data)
      
      default:
        throw new Error(`Tipo de operação não suportado: ${operation.type}`)
    }
  }

  // Métodos para operações específicas (implementar conforme sua API)
  private async createRecord(table: string, data: any): Promise<any> {
    // Implementar criação de registro
    console.log(`📝 Criando registro em ${table}:`, data)
    return { id: Date.now(), ...data }
  }

  private async updateRecord(table: string, data: any): Promise<any> {
    // Implementar atualização de registro
    console.log(`🔄 Atualizando registro em ${table}:`, data)
    return data
  }

  private async deleteRecord(table: string, data: any): Promise<any> {
    // Implementar exclusão de registro
    console.log(`🗑️ Excluindo registro em ${table}:`, data)
    return { deleted: true }
  }

  // Dividir array em chunks
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Gerar ID único para operação
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Iniciar sincronização periódica
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.operations.size > 0) {
        this.processPendingOperations()
      }
    }, this.config.syncInterval)
  }

  // Parar sincronização periódica
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Definir usuário atual
  setCurrentUser(user: any): void {
    this.currentUser = user
    
    // Filtrar operações do usuário atual
    if (user) {
      this.filterOperationsByUser(user.id)
    }
  }

  // Filtrar operações por usuário
  private filterOperationsByUser(userId: string): void {
    const userOperations = new Map<string, SyncOperation>()
    
    for (const [id, operation] of this.operations.entries()) {
      if (operation.userId === userId) {
        userOperations.set(id, operation)
      }
    }
    
    this.operations = userOperations
    console.log(`👤 Operações filtradas para usuário: ${userId} (${userOperations.size} operações)`)
  }

  // Adicionar listener para mudanças
  addListener(callback: (stats: SyncStats) => void): () => void {
    this.listeners.add(callback)
    
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notificar listeners
  private notifyListeners(): void {
    const stats = this.getStats()
    this.listeners.forEach(callback => {
      try {
        callback(stats)
      } catch (error) {
        console.error('❌ Erro ao notificar listener:', error)
      }
    })
  }

  // Obter estatísticas
  getStats(): SyncStats {
    const operations = Array.from(this.operations.values())
    
    return {
      totalOperations: operations.length,
      pendingOperations: operations.filter(op => op.status === 'pending').length,
      completedOperations: operations.filter(op => op.status === 'completed').length,
      failedOperations: operations.filter(op => op.status === 'failed').length,
      lastSyncTime: operations.length > 0 ? Math.max(...operations.map(op => op.timestamp)) : 0,
      isOnline: this.isOnline
    }
  }

  // Obter operações por status
  getOperationsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): SyncOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === status)
  }

  // Cancelar operação
  async cancelOperation(operationId: string): Promise<void> {
    const operation = this.operations.get(operationId)
    if (!operation) return

    if (operation.status === 'pending') {
      this.operations.delete(operationId)
      
      if (this.db) {
        await this.removeOperationFromDB(operationId)
      }

      console.log(`❌ Operação cancelada: ${operationId}`)
      this.notifyListeners()
    }
  }

  // Retry operação falhada
  async retryOperation(operationId: string): Promise<void> {
    const operation = this.operations.get(operationId)
    if (!operation) return

    if (operation.status === 'failed') {
      operation.status = 'pending'
      operation.retryCount = 0
      operation.error = undefined
      
      if (this.db) {
        await this.saveOperationToDB(operation)
      }

      console.log(`🔄 Operação reagendada: ${operationId}`)
      
      if (this.isOnline) {
        this.processPendingOperations()
      }
      
      this.notifyListeners()
    }
  }

  // Limpar operações completadas
  async clearCompletedOperations(): Promise<void> {
    const completedOps = this.getOperationsByStatus('completed')
    
    for (const op of completedOps) {
      this.operations.delete(op.id)
      if (this.db) {
        await this.removeOperationFromDB(op.id)
      }
    }

    console.log(`🗑️ ${completedOps.length} operações completadas removidas`)
    this.notifyListeners()
  }

  // Limpar operações falhadas
  async clearFailedOperations(): Promise<void> {
    const failedOps = this.getOperationsByStatus('failed')
    
    for (const op of failedOps) {
      this.operations.delete(op.id)
      if (this.db) {
        await this.removeOperationFromDB(op.id)
      }
    }

    console.log(`🗑️ ${failedOps.length} operações falhadas removidas`)
    this.notifyListeners()
  }

  // Limpar todas as operações
  async clearAllOperations(): Promise<void> {
    this.operations.clear()
    
    if (this.db) {
      const transaction = this.db.transaction(['sync_operations'], 'readwrite')
      const store = transaction.objectStore('sync_operations')
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }

    console.log('🗑️ Todas as operações foram removidas')
    this.notifyListeners()
  }

  // Destruir instância
  destroy(): void {
    this.stopPeriodicSync()
    this.clearAllOperations()
    this.listeners.clear()
    this.currentUser = null
    
    if (this.db) {
      this.db.close()
      this.db = null
    }

    console.log('💥 Background Sync destruído')
  }
}

// Singleton
let backgroundSync: BackgroundSync | null = null

export function getBackgroundSync(): BackgroundSync {
  if (!backgroundSync) {
    backgroundSync = new BackgroundSync()
  }
  return backgroundSync
}

// Hook para usar background sync
export function useBackgroundSync() {
  const sync = getBackgroundSync()
  
  return {
    addOperation: sync.addOperation.bind(sync),
    setCurrentUser: sync.setCurrentUser.bind(sync),
    getStats: sync.getStats.bind(sync),
    getOperationsByStatus: sync.getOperationsByStatus.bind(sync),
    cancelOperation: sync.cancelOperation.bind(sync),
    retryOperation: sync.retryOperation.bind(sync),
    clearCompletedOperations: sync.clearCompletedOperations.bind(sync),
    clearFailedOperations: sync.clearFailedOperations.bind(sync),
    clearAllOperations: sync.clearAllOperations.bind(sync),
    addListener: sync.addListener.bind(sync),
    destroy: sync.destroy.bind(sync)
  }
}
