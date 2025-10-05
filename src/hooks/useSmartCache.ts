import { useEffect, useState } from 'react';
import { cacheManager } from '@/lib/cacheManager';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSmartCache<T = any>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  let channel: RealtimeChannel | null = null;

  useEffect(() => {
    loadData();
    channel = setupRealtimeSync();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [tableName]);

  async function loadData() {
    console.log(`[useSmartCache] Loading ${tableName}...`);
    setLoading(true);
    setError(null);

    try {
      // Verificar se o cache é suportado
      if (!cacheManager.isSupported()) {
        console.warn(`[useSmartCache] IndexedDB not supported for ${tableName}, using direct DB access`);
        await syncWithRemote();
        return;
      }

      // Tentar cache primeiro
      const cachedData = await cacheManager.getTable(tableName);

      if (cachedData) {
        console.log(`[useSmartCache] Cache hit for ${tableName}`);
        setData(cachedData as T[]);
        setLoading(false);
        
        // Validar em background
        syncWithRemote();
      } else {
        console.log(`[useSmartCache] Cache miss for ${tableName}`);
        await syncWithRemote();
      }
    } catch (err) {
      console.error(`[useSmartCache] Error loading ${tableName}:`, err);
      setError(err as Error);
      setLoading(false);
    }
  }

  async function syncWithRemote() {
    setSyncStatus('syncing');

    try {
      const { data: remoteData, error: remoteError } = await supabase
        .from(tableName)
        .select('*');

      if (remoteError) throw remoteError;

      const fetchedData = remoteData || [];
      setData(fetchedData as T[]);
      
      // Salvar no cache apenas se suportado
      if (cacheManager.isSupported()) {
        await cacheManager.saveTable(tableName, fetchedData);
      }
      
      setLoading(false);
      setSyncStatus('synced');
      console.log(`[useSmartCache] Synced ${tableName} from remote`);
    } catch (err) {
      console.error(`[useSmartCache] Sync error for ${tableName}:`, err);
      setError(err as Error);
      setSyncStatus('error');
      setLoading(false);
    }
  }

  function setupRealtimeSync(): RealtimeChannel | null {
    console.log(`[useSmartCache] Setting up realtime for ${tableName}`);

    try {
      return supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          handleRealtimeChange
        )
        .subscribe();
    } catch (error) {
      console.error(`[useSmartCache] Error setting up realtime for ${tableName}:`, error);
      return null;
    }
  }

  async function handleRealtimeChange(payload: any) {
    console.log(`[useSmartCache] ${tableName} change:`, payload.eventType);

    try {
      switch (payload.eventType) {
        case 'INSERT':
          setData(prev => [...prev, payload.new as T]);
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord(tableName, payload.new);
          }
          break;

        case 'UPDATE':
          setData(prev =>
            prev.map(item =>
              (item as any).id === payload.new.id ? (payload.new as T) : item
            )
          );
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord(tableName, payload.new);
          }
          break;

        case 'DELETE':
          setData(prev =>
            prev.filter(item => (item as any).id !== payload.old.id)
          );
          if (cacheManager.isSupported()) {
            await cacheManager.deleteRecord(tableName, payload.old.id);
          }
          break;
      }
    } catch (err) {
      console.error(`[useSmartCache] Error handling realtime change:`, err);
    }
  }

  async function refresh() {
    console.log(`[useSmartCache] Manual refresh for ${tableName}`);
    if (cacheManager.isSupported()) {
      await cacheManager.clear(tableName);
    }
    await loadData();
  }

  // Função para adicionar um novo registro
  async function addRecord(record: T): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .insert(record);

      if (error) throw error;

      // O realtime listener vai atualizar automaticamente
    } catch (err) {
      console.error(`[useSmartCache] Error adding record to ${tableName}:`, err);
      throw err;
    }
  }

  // Função para atualizar um registro
  async function updateRecord(id: string, updates: Partial<T>): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // O realtime listener vai atualizar automaticamente
    } catch (err) {
      console.error(`[useSmartCache] Error updating record in ${tableName}:`, err);
      throw err;
    }
  }

  // Função para deletar um registro
  async function deleteRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // O realtime listener vai atualizar automaticamente
    } catch (err) {
      console.error(`[useSmartCache] Error deleting record from ${tableName}:`, err);
      throw err;
    }
  }

  // Função para buscar registros com filtros
  async function searchRecords(filters: Record<string, any>): Promise<T[]> {
    try {
      let query = supabase.from(tableName).select('*');

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error(`[useSmartCache] Error searching records in ${tableName}:`, err);
      throw err;
    }
  }

  return {
    data,
    loading,
    error,
    syncStatus,
    refresh,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
  };
}
