// Sistema de pré-carregamento inteligente de cache
// Carrega dados em background para melhorar a experiência do usuário

import { getVagas, getClientes, getSites, getCategorias, getCargos, getCelulas } from './vagas'
import { getAllUsers } from './auth'
import { getNoticias } from './noticias'

interface PreloadConfig {
  enabled: boolean
  interval: number // Intervalo em ms para verificar atualizações
  backgroundRefresh: boolean // Se deve atualizar em background
  priority: 'high' | 'medium' | 'low' // Prioridade do pré-carregamento
}

class CachePreloader {
  private config: PreloadConfig
  private isPreloading = false
  private lastPreloadTime = 0
  private preloadInterval: NodeJS.Timeout | null = null
  private listeners: Set<(data: any) => void> = new Set()

  constructor(config: PreloadConfig = {
    enabled: true,
    interval: 10 * 60 * 1000, // 10 minutos
    backgroundRefresh: true,
    priority: 'medium'
  }) {
    this.config = config
    this.startPreloading()
  }

  // Iniciar pré-carregamento
  private startPreloading(): void {
    if (!this.config.enabled) return

    // Pré-carregar dados imediatamente se não foram carregados recentemente
    const timeSinceLastPreload = Date.now() - this.lastPreloadTime
    if (timeSinceLastPreload > this.config.interval) {
      this.preloadData()
    }

    // Configurar intervalo para pré-carregamento periódico
    this.preloadInterval = setInterval(() => {
      if (this.config.backgroundRefresh && !this.isPreloading) {
        this.preloadData()
      }
    }, this.config.interval)
  }

  // Pré-carregar dados em background
  private async preloadData(): Promise<void> {
    if (this.isPreloading) return

    try {
      this.isPreloading = true
      console.log('🔄 Pré-carregando dados em background...')

      const startTime = performance.now()

      // Carregar dados em paralelo com prioridade baseada na configuração
      const promises = []

      if (this.config.priority === 'high') {
        // Alta prioridade: carregar tudo
        promises.push(
          getVagas(),
          getClientes(),
          getSites(),
          getCategorias(),
          getCargos(),
          getCelulas(),
          getAllUsers(),
          getNoticias()
        )
      } else if (this.config.priority === 'medium') {
        // Média prioridade: carregar dados essenciais primeiro
        promises.push(
          getVagas(),
          getClientes(),
          getSites(),
          getCategorias()
        )
        
        // Carregar dados secundários após um delay
        setTimeout(() => {
          Promise.all([
            getCargos(),
            getCelulas(),
            getAllUsers(),
            getNoticias()
          ]).catch(error => {
            console.warn('Erro ao carregar dados secundários:', error)
          })
        }, 1000)
      } else {
        // Baixa prioridade: carregar apenas dados críticos
        promises.push(
          getVagas(),
          getClientes()
        )
      }

      const results = await Promise.allSettled(promises)
      const endTime = performance.now()

      // Processar resultados
      const preloadData = {
        vagas: results[0]?.status === 'fulfilled' ? results[0].value : [],
        clientes: results[1]?.status === 'fulfilled' ? results[1].value : [],
        sites: results[2]?.status === 'fulfilled' ? results[2].value : [],
        categorias: results[3]?.status === 'fulfilled' ? results[3].value : [],
        cargos: results[4]?.status === 'fulfilled' ? results[4].value : [],
        celulas: results[5]?.status === 'fulfilled' ? results[5].value : [],
        usuarios: results[6]?.status === 'fulfilled' ? results[6].value : [],
        noticias: results[7]?.status === 'fulfilled' ? results[7].value : [],
        preloadTime: endTime - startTime,
        timestamp: Date.now()
      }

      this.lastPreloadTime = Date.now()

      // Notificar listeners
      this.notifyListeners(preloadData)

      console.log(`✅ Pré-carregamento concluído em ${(endTime - startTime).toFixed(2)}ms`)

    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error)
    } finally {
      this.isPreloading = false
    }
  }

  // Notificar listeners sobre dados pré-carregados
  private notifyListeners(data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  // Adicionar listener para dados pré-carregados
  addListener(callback: (data: any) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Forçar pré-carregamento
  async forcePreload(): Promise<void> {
    await this.preloadData()
  }

  // Verificar se está pré-carregando
  isPreloadingData(): boolean {
    return this.isPreloading
  }

  // Obter estatísticas do pré-carregamento
  getStats(): {
    isPreloading: boolean
    lastPreloadTime: number
    timeSinceLastPreload: number
    listenersCount: number
  } {
    return {
      isPreloading: this.isPreloading,
      lastPreloadTime: this.lastPreloadTime,
      timeSinceLastPreload: Date.now() - this.lastPreloadTime,
      listenersCount: this.listeners.size
    }
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Reiniciar pré-carregamento se necessário
    if (this.preloadInterval) {
      clearInterval(this.preloadInterval)
    }
    
    this.startPreloading()
  }

  // Parar pré-carregamento
  stop(): void {
    if (this.preloadInterval) {
      clearInterval(this.preloadInterval)
      this.preloadInterval = null
    }
    this.listeners.clear()
  }

  // Destruir instância
  destroy(): void {
    this.stop()
  }
}

// Singleton para o pré-carregador
let cachePreloader: CachePreloader | null = null

export function getCachePreloader(): CachePreloader {
  if (!cachePreloader) {
    cachePreloader = new CachePreloader()
  }
  return cachePreloader
}

export function destroyCachePreloader(): void {
  if (cachePreloader) {
    cachePreloader.destroy()
    cachePreloader = null
  }
}

// Hook para usar o pré-carregador
export function useCachePreloader() {
  const preloader = getCachePreloader()
  
  return {
    addListener: preloader.addListener.bind(preloader),
    forcePreload: preloader.forcePreload.bind(preloader),
    isPreloadingData: preloader.isPreloadingData.bind(preloader),
    getStats: preloader.getStats.bind(preloader),
    updateConfig: preloader.updateConfig.bind(preloader),
    stop: preloader.stop.bind(preloader)
  }
}
