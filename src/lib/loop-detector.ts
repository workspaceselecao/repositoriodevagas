/**
 * Sistema avançado de detecção e prevenção de loops infinitos
 */

const LOOP_DETECTION_KEY = 'app-loop-detection';
const LOOP_THRESHOLD = 3; // Máximo de carregamentos em 10 segundos
const LOOP_WINDOW = 10000; // Janela de 10 segundos

interface LoopDetectionData {
  timestamps: number[];
  lastReset: number;
}

/**
 * Detecta se há um loop infinito em andamento
 */
export function detectInfiniteLoop(): boolean {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(LOOP_DETECTION_KEY);
    
    let data: LoopDetectionData = stored ? JSON.parse(stored) : {
      timestamps: [],
      lastReset: now
    };

    // Limpar timestamps antigos (fora da janela)
    data.timestamps = data.timestamps.filter(ts => now - ts < LOOP_WINDOW);
    
    // Adicionar timestamp atual
    data.timestamps.push(now);
    
    // Salvar dados atualizados
    localStorage.setItem(LOOP_DETECTION_KEY, JSON.stringify(data));
    
    // Verificar se excedeu o threshold
    if (data.timestamps.length >= LOOP_THRESHOLD) {
      console.error('🚨 LOOP INFINITO DETECTADO!', {
        count: data.timestamps.length,
        window: LOOP_WINDOW,
        threshold: LOOP_THRESHOLD
      });
      
      // Limpar dados problemáticos
      clearProblematicData();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[LoopDetector] Erro ao detectar loop:', error);
    return false;
  }
}

/**
 * Limpa dados que podem estar causando loops
 */
function clearProblematicData(): void {
  try {
    console.log('🧹 Limpando dados problemáticos...');
    
    // Limpar cache de dados
    const cacheKeys = [
      'vagas-cache',
      'clientes-cache',
      'reports-cache',
      'dashboard-cache',
      'last-fetch',
      'cache-timestamp',
      'repositoriodevagas_current_version',
      'repositoriodevagas_last_check'
    ];
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Limpar dados de loop detection
    localStorage.removeItem(LOOP_DETECTION_KEY);
    
    // Limpar dados de auth problemáticos (mas manter tokens válidos)
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') && !key.includes('auth-token')
    );
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Dados problemáticos limpos');
  } catch (error) {
    console.error('[LoopDetector] Erro ao limpar dados:', error);
  }
}

/**
 * Reset do sistema de detecção de loop
 */
export function resetLoopDetection(): void {
  try {
    localStorage.removeItem(LOOP_DETECTION_KEY);
    console.log('🔄 Sistema de detecção de loop resetado');
  } catch (error) {
    console.error('[LoopDetector] Erro ao resetar:', error);
  }
}

/**
 * Classe para monitorar e prevenir loops infinitos
 */
class LoopPreventionManager {
  private lastActionTime: number = 0;
  private actionCount: number = 0;
  private readonly maxActionsPerSecond = 5;
  
  /**
   * Verifica se uma ação pode ser executada sem causar loop
   */
  canExecuteAction(): boolean {
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;
    
    // Reset contador se passou mais de 1 segundo
    if (timeSinceLastAction > 1000) {
      this.actionCount = 0;
    }
    
    // Incrementar contador
    this.actionCount++;
    this.lastActionTime = now;
    
    // Verificar se excedeu limite
    if (this.actionCount > this.maxActionsPerSecond) {
      console.warn('⚠️ Muitas ações por segundo detectadas, bloqueando para prevenir loop');
      return false;
    }
    
    return true;
  }
  
  /**
   * Executa uma ação com proteção contra loop
   */
  executeWithProtection(action: () => void, actionName: string): void {
    if (!this.canExecuteAction()) {
      console.warn(`⚠️ Ação "${actionName}" bloqueada para prevenir loop`);
      return;
    }
    
    try {
      action();
    } catch (error) {
      console.error(`❌ Erro na ação "${actionName}":`, error);
    }
  }
  
  /**
   * Reset do contador de ações
   */
  reset(): void {
    this.actionCount = 0;
    this.lastActionTime = 0;
  }
}

// Instância singleton para uso global
const loopPreventionManager = new LoopPreventionManager();

/**
 * Função para monitorar e prevenir loops infinitos (versão funcional)
 */
export function useLoopPrevention() {
  return {
    canExecuteAction: () => loopPreventionManager.canExecuteAction(),
    executeWithProtection: (action: () => void, actionName: string) => 
      loopPreventionManager.executeWithProtection(action, actionName),
    resetLoopDetection: () => {
      resetLoopDetection();
      loopPreventionManager.reset();
    }
  };
}

/**
 * Sistema de throttling para operações frequentes
 */
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  name: string
): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      console.log(`🔄 Executando função throttled: ${name}`);
      return func(...args);
    } else {
      console.log(`⏭️ Função throttled ignorada: ${name} (muito recente)`);
      
      // Cancelar timeout anterior se existir
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Agendar execução para depois do delay
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        console.log(`⏰ Executando função throttled agendada: ${name}`);
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T;
}

/**
 * Monitor de performance para detectar degradação
 */
export function createPerformanceMonitor() {
  const metrics = {
    loadTimes: [] as number[],
    errorCount: 0,
    lastError: 0
  };
  
  const startTime = Date.now();
  
  return {
    recordLoadTime: (loadTime: number) => {
      metrics.loadTimes.push(loadTime);
      
      // Manter apenas os últimos 10 tempos de carregamento
      if (metrics.loadTimes.length > 10) {
        metrics.loadTimes.shift();
      }
      
      // Verificar se há degradação de performance
      const avgLoadTime = metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length;
      if (avgLoadTime > 5000) { // Mais de 5 segundos
        console.warn('⚠️ Performance degradada detectada:', { avgLoadTime, count: metrics.loadTimes.length });
      }
    },
    
    recordError: () => {
      metrics.errorCount++;
      metrics.lastError = Date.now();
      
      if (metrics.errorCount > 5) {
        console.error('🚨 Muitos erros detectados, possivelmente em loop');
        return true; // Indica possível loop
      }
      
      return false;
    },
    
    getMetrics: () => ({
      ...metrics,
      uptime: Date.now() - startTime,
      avgLoadTime: metrics.loadTimes.length > 0 
        ? metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length 
        : 0
    }),
    
    reset: () => {
      metrics.loadTimes = [];
      metrics.errorCount = 0;
      metrics.lastError = 0;
    }
  };
}

