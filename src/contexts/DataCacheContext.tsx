import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { cacheManager } from '@/lib/cacheManager';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DataCacheContextType {
  vagas: any[];
  clientes: any[];
  loading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  refresh: (table?: string) => Promise<void>;
  invalidateCache: (table?: string) => Promise<void>;
}

const DataCacheContext = createContext<DataCacheContextType | null>(null);

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [vagas, setVagas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  
  let vagasChannel: RealtimeChannel | null = null;
  let clientesChannel: RealtimeChannel | null = null;

  useEffect(() => {
    initializeData();
    const channels = setupRealtimeListeners();

    return () => {
      // Cleanup: remover listeners
      if (vagasChannel) supabase.removeChannel(vagasChannel);
      if (clientesChannel) supabase.removeChannel(clientesChannel);
    };
  }, []);

  async function initializeData() {
    console.log('[DataCache] Initializing...');
    setLoading(true);
    setSyncStatus('syncing');

    try {
      // Verificar se o cache é suportado
      if (!cacheManager.isSupported()) {
        console.warn('[DataCache] IndexedDB not supported, falling back to direct DB access');
        await fullSync();
        return;
      }

      // Tentar carregar do cache
      const cachedVagas = await cacheManager.getTable('vagas');
      const cachedClientes = await cacheManager.getTable('clientes');

      if (cachedVagas && cachedClientes) {
        console.log('[DataCache] Loading from cache');
        setVagas(cachedVagas);
        setClientes(cachedClientes);
        setLoading(false);
        setSyncStatus('synced');

        // Validar versão em background
        validateCacheInBackground();
      } else {
        console.log('[DataCache] Cache miss, loading from DB');
        await fullSync();
      }
    } catch (error) {
      console.error('[DataCache] Initialization error:', error);
      setSyncStatus('error');
      await fullSync();
    }
  }

  async function fullSync() {
    console.log('[DataCache] Full sync starting...');
    setSyncStatus('syncing');

    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[DataCache] User not authenticated, skipping sync');
        setLoading(false);
        setSyncStatus('idle');
        return;
      }

      const [vagasRes, clientesRes] = await Promise.all([
        supabase.from('vagas').select('*'),
        supabase.from('clientes').select('*').order('nome'),
      ]);

      if (vagasRes.error) {
        console.error('[DataCache] Vagas error:', vagasRes.error);
        throw new Error(`Erro ao buscar vagas: ${vagasRes.error.message}`);
      }
      
      if (clientesRes.error) {
        console.error('[DataCache] Clientes error:', clientesRes.error);
        throw new Error(`Erro ao buscar clientes: ${clientesRes.error.message}`);
      }

      const vagasData = vagasRes.data || [];
      const clientesData = clientesRes.data || [];

      console.log(`[DataCache] Fetched ${vagasData.length} vagas and ${clientesData.length} clientes`);

      // Atualizar estado
      setVagas(vagasData);
      setClientes(clientesData);

      // Salvar no cache apenas se suportado
      if (cacheManager.isSupported()) {
        try {
          await Promise.all([
            cacheManager.saveTable('vagas', vagasData),
            cacheManager.saveTable('clientes', clientesData),
          ]);
          console.log('[DataCache] Data saved to cache successfully');
        } catch (cacheError) {
          console.warn('[DataCache] Cache save error:', cacheError);
          // Não falhar o sync por erro no cache
        }
      }

      setLoading(false);
      setSyncStatus('synced');
      console.log('[DataCache] Full sync completed successfully');
    } catch (error) {
      console.error('[DataCache] Full sync error:', error);
      setSyncStatus('error');
      setLoading(false);
      
      // Em caso de erro, tentar carregar dados do cache como fallback
      if (cacheManager.isSupported()) {
        try {
          console.log('[DataCache] Attempting fallback to cache data');
          const cachedVagas = await cacheManager.getTable('vagas');
          const cachedClientes = await cacheManager.getTable('clientes');
          
          if (cachedVagas && cachedClientes) {
            setVagas(cachedVagas);
            setClientes(cachedClientes);
            console.log('[DataCache] Fallback to cache successful');
          }
        } catch (fallbackError) {
          console.error('[DataCache] Fallback failed:', fallbackError);
        }
      }
    }
  }

  async function validateCacheInBackground() {
    try {
      // Buscar apenas contagem/versão para validar
      const [vagasCount, clientesCount] = await Promise.all([
        supabase.from('vagas').select('id', { count: 'exact', head: true }),
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
      ]);

      const vagasMeta = await cacheManager.getMetadata('vagas');
      const clientesMeta = await cacheManager.getMetadata('clientes');

      // Se contagem diferente, fazer sync
      if (
        vagasCount.count !== vagasMeta?.recordCount ||
        clientesCount.count !== clientesMeta?.recordCount
      ) {
        console.log('[DataCache] Cache outdated, syncing...');
        await fullSync();
      }
    } catch (error) {
      console.error('[DataCache] Background validation error:', error);
    }
  }

  function setupRealtimeListeners() {
    console.log('[DataCache] Setting up realtime listeners...');

    try {
      // Listener para vagas
      vagasChannel = supabase
        .channel('vagas-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vagas' },
          handleVagasChange
        )
        .subscribe();

      // Listener para clientes
      clientesChannel = supabase
        .channel('clientes-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clientes' },
          handleClientesChange
        )
        .subscribe();

      console.log('[DataCache] Realtime listeners setup complete');
    } catch (error) {
      console.error('[DataCache] Error setting up realtime listeners:', error);
    }

    return { vagasChannel, clientesChannel };
  }

  async function handleVagasChange(payload: any) {
    console.log('[DataCache] Vagas change detected:', payload.eventType);

    try {
      switch (payload.eventType) {
        case 'INSERT':
          setVagas(prev => [...prev, payload.new]);
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord('vagas', payload.new);
          }
          break;

        case 'UPDATE':
          setVagas(prev =>
            prev.map(v => (v.id === payload.new.id ? payload.new : v))
          );
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord('vagas', payload.new);
          }
          break;

        case 'DELETE':
          setVagas(prev => prev.filter(v => v.id !== payload.old.id));
          if (cacheManager.isSupported()) {
            await cacheManager.deleteRecord('vagas', payload.old.id);
          }
          break;
      }

      // Atualizar metadata apenas se cache suportado
      if (cacheManager.isSupported()) {
        const currentVagas = await cacheManager.getTable('vagas');
        if (currentVagas) {
          await cacheManager.saveTable('vagas', currentVagas);
        }
      }
    } catch (error) {
      console.error('[DataCache] Error handling vagas change:', error);
    }
  }

  async function handleClientesChange(payload: any) {
    console.log('[DataCache] Clientes change detected:', payload.eventType);

    try {
      switch (payload.eventType) {
        case 'INSERT':
          setClientes(prev => [...prev, payload.new].sort((a, b) => 
            a.nome.localeCompare(b.nome)
          ));
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord('clientes', payload.new);
          }
          break;

        case 'UPDATE':
          setClientes(prev =>
            prev.map(c => (c.id === payload.new.id ? payload.new : c))
          );
          if (cacheManager.isSupported()) {
            await cacheManager.updateRecord('clientes', payload.new);
          }
          break;

        case 'DELETE':
          setClientes(prev => prev.filter(c => c.id !== payload.old.id));
          if (cacheManager.isSupported()) {
            await cacheManager.deleteRecord('clientes', payload.old.id);
          }
          break;
      }

      // Atualizar metadata apenas se cache suportado
      if (cacheManager.isSupported()) {
        const currentClientes = await cacheManager.getTable('clientes');
        if (currentClientes) {
          await cacheManager.saveTable('clientes', currentClientes);
        }
      }
    } catch (error) {
      console.error('[DataCache] Error handling clientes change:', error);
    }
  }

  async function refresh(table?: string) {
    console.log('[DataCache] Manual refresh triggered');
    if (table && cacheManager.isSupported()) {
      await cacheManager.clear(table);
    }
    await fullSync();
  }

  async function invalidateCache(table?: string) {
    console.log('[DataCache] Invalidating cache');
    if (cacheManager.isSupported()) {
      await cacheManager.clear(table);
    }
    if (!table) {
      setVagas([]);
      setClientes([]);
      setLoading(true);
    }
  }

  return (
    <DataCacheContext.Provider
      value={{
        vagas,
        clientes,
        loading,
        syncStatus,
        refresh,
        invalidateCache,
      }}
    >
      {children}
    </DataCacheContext.Provider>
  );
}

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
};
