/**
 * Utilitários para gerenciamento de cache
 */

// Verificar suporte do navegador
export function isCacheSupported(): boolean {
  return 'indexedDB' in window;
}

// Obter tamanho estimado do cache
export async function getCacheSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

// Obter espaço disponível
export async function getAvailableSpace(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.quota || 0;
  }
  return 0;
}

// Formatar bytes para leitura humana
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Calcular percentual de uso
export async function getCacheUsagePercent(): Promise<number> {
  const size = await getCacheSize();
  const available = await getAvailableSpace();
  
  if (available === 0) return 0;
  return Math.round((size / available) * 100);
}

// Verificar se precisa limpar cache por espaço
export async function shouldClearCache(): Promise<boolean> {
  const usage = await getCacheUsagePercent();
  return usage > 80; // Se usar mais de 80%
}

// Comprimir dados (simples)
export function compressData(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error compressing data:', error);
    return '';
  }
}

// Descomprimir dados
export function decompressData(compressed: string): any {
  try {
    return JSON.parse(compressed);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
}

// Gerar hash MD5 simples
export function generateHash(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return hash.toString(36);
}

// Validar integridade dos dados
export function validateData(data: any, expectedHash?: string): boolean {
  if (!data) return false;
  
  if (expectedHash) {
    const currentHash = generateHash(data);
    return currentHash === expectedHash;
  }
  
  return true;
}

// Logger estruturado para cache
export const cacheLogger = {
  hit: (table: string, recordCount: number) => {
    console.log(`[CACHE HIT] ${table}: ${recordCount} records from IndexedDB`);
  },
  
  miss: (table: string) => {
    console.log(`[CACHE MISS] ${table}: fetching from Supabase`);
  },
  
  sync: (table: string, duration: number, recordCount: number) => {
    console.log(`[CACHE SYNC] ${table}: ${recordCount} records in ${duration}ms`);
  },
  
  error: (table: string, error: Error) => {
    console.error(`[CACHE ERROR] ${table}:`, error.message);
  },
  
  clear: (table?: string) => {
    console.log(`[CACHE CLEAR] ${table || 'all tables'}`);
  },
  
  update: (table: string, id: string) => {
    console.log(`[CACHE UPDATE] ${table}: record ${id}`);
  },
  
  delete: (table: string, id: string) => {
    console.log(`[CACHE DELETE] ${table}: record ${id}`);
  }
};

// Sistema de priorização para sincronização
export const SYNC_PRIORITY = ['vagas', 'clientes', 'usuarios', 'configuracoes'];

export async function syncByPriority(
  tables: string[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const sortedTables = tables.sort((a, b) => {
    const aIndex = SYNC_PRIORITY.indexOf(a);
    const bIndex = SYNC_PRIORITY.indexOf(b);
    return aIndex - bIndex;
  });

  for (let i = 0; i < sortedTables.length; i++) {
    const table = sortedTables[i];
    
    if (onProgress) {
      onProgress(i + 1, sortedTables.length);
    }
    
    // Simular sincronização (implementar conforme necessário)
    console.log(`[SYNC PRIORITY] Syncing table: ${table} (${i + 1}/${sortedTables.length})`);
    
    // Aqui você implementaria a lógica de sincronização real
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Função para detectar mudanças offline/online
export function setupOfflineDetection(
  onOffline: () => void,
  onOnline: () => void
): () => void {
  const handleOffline = () => {
    console.log('[CACHE] Network offline detected');
    onOffline();
  };

  const handleOnline = () => {
    console.log('[CACHE] Network online detected');
    onOnline();
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  // Cleanup function
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}

// Função para debounce de operações de cache
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Função para throttle de operações de cache
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Função para retry com backoff exponencial
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.log(`[CACHE RETRY] Attempt ${i + 1} failed, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Função para medir performance de operações
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[PERFORMANCE] ${name}: ${duration.toFixed(2)}ms`);
      resolve(result);
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      console.error(`[PERFORMANCE] ${name} failed after ${duration.toFixed(2)}ms:`, error);
      reject(error);
    }
  });
}

// Função para criar cache key com namespace
export function createCacheKey(namespace: string, key: string, userId?: string): string {
  const parts = [namespace, key];
  if (userId) {
    parts.unshift(userId);
  }
  return parts.join(':');
}

// Função para extrair informações do cache key
export function parseCacheKey(cacheKey: string): { namespace: string; key: string; userId?: string } {
  const parts = cacheKey.split(':');
  
  if (parts.length === 2) {
    return { namespace: parts[0], key: parts[1] };
  } else if (parts.length === 3) {
    return { userId: parts[0], namespace: parts[1], key: parts[2] };
  }
  
  return { namespace: 'unknown', key: cacheKey };
}

// Função para limpar cache expirado
export async function cleanupExpiredCache(
  cacheManager: any,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 horas
): Promise<void> {
  try {
    const tables = ['vagas', 'clientes'];
    const now = Date.now();
    
    for (const table of tables) {
      const metadata = await cacheManager.getMetadata(table);
      
      if (metadata && (now - metadata.lastSync) > maxAge) {
        console.log(`[CACHE CLEANUP] Removing expired cache for ${table}`);
        await cacheManager.clear(table);
      }
    }
  } catch (error) {
    console.error('[CACHE CLEANUP] Error during cleanup:', error);
  }
}
