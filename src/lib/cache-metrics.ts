// Sistema de métricas de performance do cache
// Monitora operações de cache, tempos de resposta e estatísticas de uso

interface CacheMetrics {
  // Operações básicas
  hits: number
  misses: number
  sets: number
  deletes: number
  
  // Tempos de operação
  averageLoadTime: number
  averageSaveTime: number
  averageCompressionTime: number
  averageDecompressionTime: number
  
  // Estatísticas de tamanho
  totalDataSize: number
  compressedDataSize: number
  compressionRatio: number
  
  // Estatísticas de sincronização
  syncMessagesSent: number
  syncMessagesReceived: number
  activeTabs: number
  
  // Timestamps
  firstAccess: number
  lastAccess: number
  lastUpdate: number
  
  // Performance por seção
  sectionMetrics: {
    vagas: SectionMetrics
    clientes: SectionMetrics
    sites: SectionMetrics
    categorias: SectionMetrics
    cargos: SectionMetrics
    celulas: SectionMetrics
    usuarios: SectionMetrics
    noticias: SectionMetrics
  }
}

interface SectionMetrics {
  hits: number
  misses: number
  loadTime: number
  lastAccess: number
  dataSize: number
}

interface PerformanceTimer {
  startTime: number
  operation: string
  section?: string
}

class CacheMetricsCollector {
  private metrics: CacheMetrics
  private timers: Map<string, PerformanceTimer> = new Map()
  private listeners: Set<(metrics: CacheMetrics) => void> = new Set()

  constructor() {
    this.metrics = this.initializeMetrics()
    this.loadFromStorage()
  }

  private initializeMetrics(): CacheMetrics {
    const now = Date.now()
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      averageLoadTime: 0,
      averageSaveTime: 0,
      averageCompressionTime: 0,
      averageDecompressionTime: 0,
      totalDataSize: 0,
      compressedDataSize: 0,
      compressionRatio: 0,
      syncMessagesSent: 0,
      syncMessagesReceived: 0,
      activeTabs: 1,
      firstAccess: now,
      lastAccess: now,
      lastUpdate: now,
      sectionMetrics: {
        vagas: this.createSectionMetrics(),
        clientes: this.createSectionMetrics(),
        sites: this.createSectionMetrics(),
        categorias: this.createSectionMetrics(),
        cargos: this.createSectionMetrics(),
        celulas: this.createSectionMetrics(),
        usuarios: this.createSectionMetrics(),
        noticias: this.createSectionMetrics()
      }
    }
  }

  private createSectionMetrics(): SectionMetrics {
    return {
      hits: 0,
      misses: 0,
      loadTime: 0,
      lastAccess: 0,
      dataSize: 0
    }
  }

  // Métodos de timing
  startTimer(operation: string, section?: string): string {
    const timerId = `${operation}_${section || 'global'}_${Date.now()}`
    this.timers.set(timerId, {
      startTime: performance.now(),
      operation,
      section
    })
    return timerId
  }

  endTimer(timerId: string): number {
    const timer = this.timers.get(timerId)
    if (!timer) return 0

    const duration = performance.now() - timer.startTime
    this.timers.delete(timerId)

    // Atualizar métricas baseadas no tipo de operação
    this.updateOperationMetrics(timer.operation, duration, timer.section)
    
    return duration
  }

  private updateOperationMetrics(operation: string, duration: number, section?: string): void {
    switch (operation) {
      case 'load':
        this.metrics.averageLoadTime = this.calculateAverage(this.metrics.averageLoadTime, duration, this.metrics.sets)
        if (section && this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]) {
          const sectionMetrics = this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]
          sectionMetrics.loadTime = this.calculateAverage(sectionMetrics.loadTime, duration, sectionMetrics.hits + sectionMetrics.misses)
          sectionMetrics.lastAccess = Date.now()
        }
        break
      case 'save':
        this.metrics.averageSaveTime = this.calculateAverage(this.metrics.averageSaveTime, duration, this.metrics.sets)
        break
      case 'compress':
        this.metrics.averageCompressionTime = this.calculateAverage(this.metrics.averageCompressionTime, duration, this.metrics.sets)
        break
      case 'decompress':
        this.metrics.averageDecompressionTime = this.calculateAverage(this.metrics.averageDecompressionTime, duration, this.metrics.sets)
        break
    }
  }

  private calculateAverage(currentAverage: number, newValue: number, count: number): number {
    return (currentAverage * count + newValue) / (count + 1)
  }

  // Métodos de métricas
  recordHit(section?: string): void {
    this.metrics.hits++
    this.metrics.lastAccess = Date.now()
    
    if (section && this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]) {
      this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics].hits++
    }
    
    this.notifyListeners()
  }

  recordMiss(section?: string): void {
    this.metrics.misses++
    this.metrics.lastAccess = Date.now()
    
    if (section && this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]) {
      this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics].misses++
    }
    
    this.notifyListeners()
  }

  recordSet(section?: string, dataSize?: number): void {
    this.metrics.sets++
    this.metrics.lastUpdate = Date.now()
    
    if (section && this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]) {
      this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics].lastAccess = Date.now()
      if (dataSize) {
        this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics].dataSize = dataSize
      }
    }
    
    this.notifyListeners()
  }

  recordDelete(section?: string): void {
    this.metrics.deletes++
    this.metrics.lastUpdate = Date.now()
    this.notifyListeners()
  }

  updateDataSize(totalSize: number, compressedSize?: number): void {
    this.metrics.totalDataSize = totalSize
    if (compressedSize) {
      this.metrics.compressedDataSize = compressedSize
      this.metrics.compressionRatio = ((totalSize - compressedSize) / totalSize) * 100
    }
    this.notifyListeners()
  }

  updateSyncStats(sent: number, received: number, activeTabs: number): void {
    this.metrics.syncMessagesSent = sent
    this.metrics.syncMessagesReceived = received
    this.metrics.activeTabs = activeTabs
    this.notifyListeners()
  }

  // Métodos de acesso
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses
    return total > 0 ? (this.metrics.hits / total) * 100 : 0
  }

  getSectionHitRate(section: string): number {
    const sectionMetrics = this.metrics.sectionMetrics[section as keyof typeof this.metrics.sectionMetrics]
    if (!sectionMetrics) return 0
    
    const total = sectionMetrics.hits + sectionMetrics.misses
    return total > 0 ? (sectionMetrics.hits / total) * 100 : 0
  }

  getPerformanceScore(): number {
    const hitRate = this.getHitRate()
    const avgLoadTime = this.metrics.averageLoadTime
    const compressionRatio = this.metrics.compressionRatio
    
    // Score baseado em hit rate (40%), tempo de carregamento (30%) e compressão (30%)
    const hitScore = Math.min(hitRate, 100)
    const loadScore = Math.max(0, 100 - (avgLoadTime / 10)) // Penalizar tempos > 100ms
    const compressionScore = Math.min(compressionRatio, 50) // Máximo 50% de benefício da compressão
    
    return (hitScore * 0.4) + (loadScore * 0.3) + (compressionScore * 0.3)
  }

  // Persistência
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cache_metrics')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.metrics = { ...this.metrics, ...parsed }
      }
    } catch (error) {
      console.error('Erro ao carregar métricas do cache:', error)
    }
  }

  saveToStorage(): void {
    try {
      localStorage.setItem('cache_metrics', JSON.stringify(this.metrics))
    } catch (error) {
      console.error('Erro ao salvar métricas do cache:', error)
    }
  }

  // Listeners
  addListener(callback: (metrics: CacheMetrics) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.metrics))
    this.saveToStorage()
  }

  // Reset
  reset(): void {
    this.metrics = this.initializeMetrics()
    this.timers.clear()
    this.notifyListeners()
  }

  // Relatório detalhado
  generateReport(): string {
    const hitRate = this.getHitRate()
    const performanceScore = this.getPerformanceScore()
    const uptime = Date.now() - this.metrics.firstAccess
    
    return `
📊 Relatório de Performance do Cache
=====================================

🎯 Taxa de Acerto: ${hitRate.toFixed(1)}%
⚡ Score de Performance: ${performanceScore.toFixed(1)}/100
⏱️ Tempo Ativo: ${this.formatDuration(uptime)}

📈 Operações:
• Hits: ${this.metrics.hits}
• Misses: ${this.metrics.misses}
• Sets: ${this.metrics.sets}
• Deletes: ${this.metrics.deletes}

⏱️ Tempos Médios:
• Carregamento: ${this.metrics.averageLoadTime.toFixed(2)}ms
• Salvamento: ${this.metrics.averageSaveTime.toFixed(2)}ms
• Compressão: ${this.metrics.averageCompressionTime.toFixed(2)}ms
• Descompressão: ${this.metrics.averageDecompressionTime.toFixed(2)}ms

💾 Tamanho dos Dados:
• Total: ${this.formatSize(this.metrics.totalDataSize)}
• Comprimido: ${this.formatSize(this.metrics.compressedDataSize)}
• Taxa de Compressão: ${this.metrics.compressionRatio.toFixed(1)}%

🔄 Sincronização:
• Mensagens Enviadas: ${this.metrics.syncMessagesSent}
• Mensagens Recebidas: ${this.metrics.syncMessagesReceived}
• Abas Ativas: ${this.metrics.activeTabs}
    `.trim()
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Singleton para o coletor de métricas
let metricsCollector: CacheMetricsCollector | null = null

export function getCacheMetricsCollector(): CacheMetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new CacheMetricsCollector()
  }
  return metricsCollector
}

export function destroyCacheMetricsCollector(): void {
  if (metricsCollector) {
    metricsCollector.saveToStorage()
    metricsCollector = null
  }
}

// Hook para usar métricas do cache
export function useCacheMetrics() {
  const collector = getCacheMetricsCollector()
  
  return {
    getMetrics: collector.getMetrics.bind(collector),
    getHitRate: collector.getHitRate.bind(collector),
    getSectionHitRate: collector.getSectionHitRate.bind(collector),
    getPerformanceScore: collector.getPerformanceScore.bind(collector),
    generateReport: collector.generateReport.bind(collector),
    recordHit: collector.recordHit.bind(collector),
    recordMiss: collector.recordMiss.bind(collector),
    recordSet: collector.recordSet.bind(collector),
    recordDelete: collector.recordDelete.bind(collector),
    updateDataSize: collector.updateDataSize.bind(collector),
    updateSyncStats: collector.updateSyncStats.bind(collector),
    startTimer: collector.startTimer.bind(collector),
    endTimer: collector.endTimer.bind(collector),
    addListener: collector.addListener.bind(collector),
    reset: collector.reset.bind(collector)
  }
}
