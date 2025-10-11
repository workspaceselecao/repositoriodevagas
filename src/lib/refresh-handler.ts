/**
 * Sistema de gerenciamento de refresh para prevenir loops infinitos
 */

const REFRESH_LOCK_KEY = 'app-refresh-lock';
const REFRESH_LOCK_DURATION = 5000; // 5 segundos

/**
 * Verifica se há um lock de refresh ativo
 */
export function isRefreshLocked(): boolean {
  const lockData = sessionStorage.getItem(REFRESH_LOCK_KEY);
  
  if (!lockData) {
    return false;
  }

  try {
    const { timestamp } = JSON.parse(lockData);
    const now = Date.now();
    
    // Se o lock expirou, remover
    if (now - timestamp > REFRESH_LOCK_DURATION) {
      sessionStorage.removeItem(REFRESH_LOCK_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[RefreshHandler] Erro ao verificar lock:', error);
    sessionStorage.removeItem(REFRESH_LOCK_KEY);
    return false;
  }
}

/**
 * Cria um lock de refresh temporário
 */
export function setRefreshLock(): void {
  const lockData = {
    timestamp: Date.now()
  };
  
  sessionStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(lockData));
  console.log('[RefreshHandler] Lock de refresh criado');
  
  // Auto-remover após a duração
  setTimeout(() => {
    sessionStorage.removeItem(REFRESH_LOCK_KEY);
    console.log('[RefreshHandler] Lock de refresh removido automaticamente');
  }, REFRESH_LOCK_DURATION);
}

/**
 * Remove o lock de refresh
 */
export function clearRefreshLock(): void {
  sessionStorage.removeItem(REFRESH_LOCK_KEY);
  console.log('[RefreshHandler] Lock de refresh removido manualmente');
}

/**
 * Hook para detectar e gerenciar refresh da página
 */
export function handlePageRefresh(): void {
  // Detectar se a página foi recarregada
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (perfData && perfData.type === 'reload') {
    console.log('[RefreshHandler] Refresh da página detectado');
    
    // CORREÇÃO: Verificar se já há um lock ativo de forma menos agressiva
    if (isRefreshLocked()) {
      console.warn('[RefreshHandler] Múltiplos refreshes detectados - verificando se é realmente um loop...');
      
      // CORREÇÃO: Só limpar dados se realmente houver muitos refreshes consecutivos
      const refreshCount = getRefreshCount();
      if (refreshCount > 3) { // Só agir se houver mais de 3 refreshes
        console.warn('[RefreshHandler] Loop infinito confirmado, limpando dados problemáticos...');
        
        // Limpar dados problemáticos que podem estar causando o loop
        try {
          const problematicKeys = [
            'last-error',
            'error-count',
            'retry-count'
          ];
          
          problematicKeys.forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
          });
          
          console.log('[RefreshHandler] Dados problemáticos limpos');
        } catch (error) {
          console.error('[RefreshHandler] Erro ao limpar dados:', error);
        }
      } else {
        console.log('[RefreshHandler] Refresh normal detectado, não é um loop infinito');
      }
    }
    
    // CORREÇÃO: Criar lock apenas se necessário
    if (!isRefreshLocked()) {
      setRefreshLock();
    }
  } else {
    console.log('[RefreshHandler] Carregamento normal da página');
  }
}

/**
 * Contar quantos refreshes ocorreram recentemente
 */
function getRefreshCount(): number {
  const REFRESH_COUNT_KEY = 'refresh-count';
  const REFRESH_WINDOW = 30000; // 30 segundos
  
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(REFRESH_COUNT_KEY);
    
    let data = stored ? JSON.parse(stored) : { count: 0, lastReset: now };
    
    // Reset se passou muito tempo
    if (now - data.lastReset > REFRESH_WINDOW) {
      data = { count: 0, lastReset: now };
    }
    
    // Incrementar contador
    data.count++;
    
    // Salvar
    sessionStorage.setItem(REFRESH_COUNT_KEY, JSON.stringify(data));
    
    return data.count;
  } catch (error) {
    console.error('[RefreshHandler] Erro ao contar refreshes:', error);
    return 0;
  }
}

/**
 * Detectar se a aplicação está em loop infinito (versão menos agressiva)
 */
export function detectInfiniteLoop(): boolean {
  const LOOP_CHECK_KEY = 'loop-check-timestamps';
  const MAX_LOADS_IN_PERIOD = 8; // Aumentado de 5 para 8
  const CHECK_PERIOD = 60000; // Aumentado para 60 segundos
  
  try {
    const storedData = sessionStorage.getItem(LOOP_CHECK_KEY);
    const now = Date.now();
    
    let timestamps: number[] = storedData ? JSON.parse(storedData) : [];
    
    // Remover timestamps antigos
    timestamps = timestamps.filter(ts => now - ts < CHECK_PERIOD);
    
    // Adicionar timestamp atual
    timestamps.push(now);
    
    // Salvar de volta
    sessionStorage.setItem(LOOP_CHECK_KEY, JSON.stringify(timestamps));
    
    // CORREÇÃO: Verificar se há muitos carregamentos de forma menos agressiva
    if (timestamps.length >= MAX_LOADS_IN_PERIOD) {
      console.error('[RefreshHandler] ⚠️ Possível loop infinito detectado!');
      
      // CORREÇÃO: Não limpar tudo imediatamente, apenas dados específicos
      try {
        const problematicKeys = [
          'loop-check-timestamps',
          'app-refresh-lock',
          'refresh-count'
        ];
        
        problematicKeys.forEach(key => {
          sessionStorage.removeItem(key);
        });
        
        // CORREÇÃO: Não limpar caches importantes que podem ser necessários
        console.log('[RefreshHandler] Dados de loop limpos, mas caches preservados');
      } catch (error) {
        console.error('[RefreshHandler] Erro ao limpar dados de loop:', error);
      }
      
      // CORREÇÃO: Não mostrar alert imediatamente, apenas log
      console.warn('[RefreshHandler] Loop detectado, mas não bloqueando aplicação');
      
      return false; // CORREÇÃO: Não retornar true para não bloquear a aplicação
    }
    
    return false;
  } catch (error) {
    console.error('[RefreshHandler] Erro ao detectar loop:', error);
    return false;
  }
}

