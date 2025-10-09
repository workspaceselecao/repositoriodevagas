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
    
    // Verificar se já há um lock ativo
    if (isRefreshLocked()) {
      console.warn('[RefreshHandler] Múltiplos refreshes detectados - possível loop infinito!');
      
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
    }
    
    // Criar novo lock
    setRefreshLock();
  } else {
    console.log('[RefreshHandler] Carregamento normal da página');
  }
}

/**
 * Detectar se a aplicação está em loop infinito
 */
export function detectInfiniteLoop(): boolean {
  const LOOP_CHECK_KEY = 'loop-check-timestamps';
  const MAX_LOADS_IN_PERIOD = 5; // Máximo de carregamentos
  const CHECK_PERIOD = 30000; // em 30 segundos
  
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
    
    // Verificar se há muitos carregamentos
    if (timestamps.length >= MAX_LOADS_IN_PERIOD) {
      console.error('[RefreshHandler] ⚠️ LOOP INFINITO DETECTADO!');
      
      // Limpar tudo para tentar recuperar
      sessionStorage.clear();
      localStorage.removeItem('vagas-cache');
      localStorage.removeItem('clientes-cache');
      
      // Notificar usuário
      alert('Detectamos um problema com o carregamento da aplicação. A página será recarregada uma última vez.');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[RefreshHandler] Erro ao detectar loop:', error);
    return false;
  }
}

