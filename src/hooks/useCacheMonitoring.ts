import { useEffect, useState } from 'react';
import { getCacheSize, getCacheUsagePercent } from '@/lib/cacheUtils';

interface CacheStats {
  size: number;
  usagePercent: number;
  hitRate: number;
  missRate: number;
}

export function useCacheMonitoring(intervalMs: number = 5000) {
  const [stats, setStats] = useState<CacheStats>({
    size: 0,
    usagePercent: 0,
    hitRate: 0,
    missRate: 0,
  });

  useEffect(() => {
    let hits = 0;
    let misses = 0;

    async function updateStats() {
      const size = await getCacheSize();
      const usagePercent = await getCacheUsagePercent();
      
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;
      const missRate = total > 0 ? (misses / total) * 100 : 0;

      setStats({
        size,
        usagePercent,
        hitRate,
        missRate,
      });
    }

    updateStats();
    const interval = setInterval(updateStats, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return stats;
}
