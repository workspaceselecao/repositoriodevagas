import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DataContextType {
  vagas: any[];
  clientes: any[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [vagas, setVagas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  let vagasChannel: RealtimeChannel | null = null;
  let clientesChannel: RealtimeChannel | null = null;

  useEffect(() => {
    loadData();
    setupRealtimeListeners();

    return () => {
      // Cleanup: remover listeners
      if (vagasChannel) supabase.removeChannel(vagasChannel);
      if (clientesChannel) supabase.removeChannel(clientesChannel);
    };
  }, []);

  async function loadData() {
    console.log('[DataProvider] Carregando dados...');
    setLoading(true);

    try {
      // Carregar vagas
      const { data: vagasData, error: vagasError } = await supabase
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (vagasError) {
        console.error('[DataProvider] Erro ao carregar vagas:', vagasError);
      } else {
        setVagas(vagasData || []);
        console.log(`[DataProvider] ${vagasData?.length || 0} vagas carregadas`);
      }

      // Carregar clientes (extrair da tabela vagas)
      const { data: clientesData, error: clientesError } = await supabase
        .from('vagas')
        .select('cliente')
        .not('cliente', 'is', null)
        .order('cliente');

      if (clientesError) {
        console.error('[DataProvider] Erro ao carregar clientes:', clientesError);
      } else {
        const uniqueClientes = [...new Set(clientesData?.map(item => item.cliente).filter(Boolean) || [])];
        setClientes(uniqueClientes.map(cliente => ({ nome: cliente })));
        console.log(`[DataProvider] ${uniqueClientes.length} clientes carregados`);
      }

    } catch (error) {
      console.error('[DataProvider] Erro geral:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    console.log('[DataProvider] Atualizando dados...');
    await loadData();
  }

  function setupRealtimeListeners() {
    console.log('[DataProvider] Configurando listeners de tempo real...');

    // Listener para vagas
    vagasChannel = supabase
      .channel('vagas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vagas' },
        handleVagasChange
      )
      .subscribe((status) => {
        console.log('[DataProvider] Vagas channel status:', status);
        if (status === 'CLOSED') {
          console.warn('[DataProvider] Vagas channel closed, will retry...');
          setTimeout(() => {
            if (vagasChannel) {
              vagasChannel.unsubscribe();
              setupRealtimeListeners();
            }
          }, 5000);
        }
      });

    // Listener para clientes (baseado em vagas)
    clientesChannel = supabase
      .channel('clientes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vagas' },
        handleClientesChange
      )
      .subscribe((status) => {
        console.log('[DataProvider] Clientes channel status:', status);
        if (status === 'CLOSED') {
          console.warn('[DataProvider] Clientes channel closed, will retry...');
          setTimeout(() => {
            if (clientesChannel) {
              clientesChannel.unsubscribe();
              setupRealtimeListeners();
            }
          }, 5000);
        }
      });

    return { vagasChannel, clientesChannel };
  }

  async function handleVagasChange(payload: any) {
    console.log('[DataProvider] Mudança detectada em vagas:', payload.eventType);

    try {
      switch (payload.eventType) {
        case 'INSERT':
          setVagas(prev => [payload.new, ...prev]);
          break;

        case 'UPDATE':
          setVagas(prev =>
            prev.map(v => (v.id === payload.new.id ? payload.new : v))
          );
          break;

        case 'DELETE':
          console.log('[DataProvider] Removendo vaga:', payload.old.id);
          setVagas(prev => prev.filter(v => v.id !== payload.old.id));
          break;
      }
    } catch (error) {
      console.error('[DataProvider] Erro ao processar mudança em vagas:', error);
    }
  }

  async function handleClientesChange(payload: any) {
    console.log('[DataProvider] Mudança detectada em clientes (via vagas):', payload.eventType);

    try {
      // Recarregar clientes quando vagas mudam
      const { data: clientesData, error: clientesError } = await supabase
        .from('vagas')
        .select('cliente')
        .not('cliente', 'is', null)
        .order('cliente');

      if (!clientesError && clientesData) {
        const uniqueClientes = [...new Set(clientesData.map(item => item.cliente).filter(Boolean))];
        setClientes(uniqueClientes.map(cliente => ({ nome: cliente })));
      }
    } catch (error) {
      console.error('[DataProvider] Erro ao processar mudança em clientes:', error);
    }
  }

  const value = {
    vagas,
    clientes,
    loading,
    refresh
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}
