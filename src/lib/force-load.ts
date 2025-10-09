// Sistema de carregamento forçado para garantir que os dados sejam sempre carregados
import { supabase } from './supabase'

interface ForceLoadOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
}

export class ForceLoader {
  private static instance: ForceLoader
  private cache: Map<string, any> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()

  static getInstance(): ForceLoader {
    if (!ForceLoader.instance) {
      ForceLoader.instance = new ForceLoader()
    }
    return ForceLoader.instance
  }

  async forceLoadVagas(options: ForceLoadOptions = {}): Promise<any[]> {
    const cacheKey = 'vagas'
    const { maxRetries = 5, retryDelay = 1000, timeout = 10000 } = options

    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      console.log('🚀 [ForceLoader] Dados de vagas carregados do cache')
      return this.cache.get(cacheKey)
    }

    // Verificar se já está carregando
    if (this.loadingPromises.has(cacheKey)) {
      console.log('🔄 [ForceLoader] Aguardando carregamento em andamento...')
      return this.loadingPromises.get(cacheKey)!
    }

    // Iniciar carregamento
    const loadPromise = this.loadWithRetry(cacheKey, maxRetries, retryDelay, timeout)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const result = await loadPromise
      this.cache.set(cacheKey, result)
      console.log(`✅ [ForceLoader] ${result.length} vagas carregadas com sucesso`)
      return result
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  private async loadWithRetry(
    cacheKey: string, 
    maxRetries: number, 
    retryDelay: number, 
    timeout: number
  ): Promise<any[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [ForceLoader] Tentativa ${attempt}/${maxRetries} - Carregando ${cacheKey}...`)
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )

        const loadPromise = this.loadFromSupabase()
        
        const result = await Promise.race([loadPromise, timeoutPromise])
        
        if (result && result.length >= 0) {
          console.log(`✅ [ForceLoader] ${cacheKey} carregados com sucesso na tentativa ${attempt}`)
          return result
        }
        
        throw new Error('Resultado vazio')
        
      } catch (error) {
        console.warn(`⚠️ [ForceLoader] Tentativa ${attempt} falhou:`, error)
        
        if (attempt === maxRetries) {
          console.error(`❌ [ForceLoader] Todas as tentativas falharam para ${cacheKey}`)
          // Retornar dados vazios em vez de falhar completamente
          return []
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    return []
  }

  private async loadFromSupabase(): Promise<any[]> {
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return data || []
  }

  // Limpar cache quando necessário
  clearCache(): void {
    console.log('🧹 [ForceLoader] Cache limpo')
    this.cache.clear()
  }

  // Forçar recarregamento
  async forceReload(): Promise<any[]> {
    this.clearCache()
    return this.forceLoadVagas()
  }
}

// Instância singleton
export const forceLoader = ForceLoader.getInstance()
