import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

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
  
  // Usar refs para gerenciar channels corretamente e evitar loops
  const vagasChannelRef = useRef<RealtimeChannel | null>(null);
  const clientesChannelRef = useRef<RealtimeChannel | null>(null);
  const isUnmountedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const loadingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    isUnmountedRef.current = false;

    const initialize = async () => {
      if (!mounted) return;
      await loadData();
      if (mounted) {
        setupRealtimeListeners();
      }
    };

    initialize();

    return () => {
      mounted = false;
      isUnmountedRef.current = true;
      cleanupChannels();
    };
  }, []);

  // Função para limpar channels de forma segura
  function cleanupChannels() {
    console.log('[DataProvider] Limpando channels...');
    
    if (vagasChannelRef.current) {
      try {
        supabase.removeChannel(vagasChannelRef.current);
        vagasChannelRef.current = null;
      } catch (error) {
        console.error('[DataProvider] Erro ao remover vagasChannel:', error);
      }
    }

    if (clientesChannelRef.current) {
      try {
        supabase.removeChannel(clientesChannelRef.current);
        clientesChannelRef.current = null;
      } catch (error) {
        console.error('[DataProvider] Erro ao remover clientesChannel:', error);
      }
    }
  }

  async function loadData() {
    // Prevenir múltiplas chamadas simultâneas
    if (loadingRef.current || isUnmountedRef.current) {
      console.log('[DataProvider] Carregamento já em andamento ou componente desmontado, ignorando...');
      return;
    }

    loadingRef.current = true;
    console.log('[DataProvider] Carregando dados...');
    setLoading(true);

    try {
      // Carregar vagas
      const { data: vagasData, error: vagasError } = await supabase
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (isUnmountedRef.current) return;

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

      if (isUnmountedRef.current) return;

      if (clientesError) {
        console.error('[DataProvider] Erro ao carregar clientes:', clientesError);
      } else {
        const uniqueClientes = [...new Set(clientesData?.map(item => item.cliente).filter(Boolean) || [])];
        setClientes(uniqueClientes.map(cliente => ({ nome: cliente })));
        console.log(`[DataProvider] ${uniqueClientes.length} clientes carregados`);
      }

      // Resetar contador de retries após sucesso
      retryCountRef.current = 0;

    } catch (error) {
      console.error('[DataProvider] Erro geral:', error);
    } finally {
      loadingRef.current = false;
      if (!isUnmountedRef.current) {
        setLoading(false);
      }
    }
  }

  async function refresh() {
    if (isUnmountedRef.current) return;
    console.log('[DataProvider] Atualizando dados...');
    await loadData();
  }

  function setupRealtimeListeners() {
    if (isUnmountedRef.current) {
      console.log('[DataProvider] Componente desmontado, não configurando listeners');
      return;
    }

    // Limpar channels existentes antes de criar novos
    cleanupChannels();

    console.log('[DataProvider] Configurando listeners de tempo real...');

    // Listener para vagas
    vagasChannelRef.current = supabase
      .channel(`vagas-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vagas' },
        handleVagasChange
      )
      .subscribe((status) => {
        if (isUnmountedRef.current) return;
        
        console.log('[DataProvider] Vagas channel status:', status);
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[DataProvider] Erro no canal de vagas:', status);
          handleChannelError();
        } else if (status === 'SUBSCRIBED') {
          console.log('[DataProvider] ✅ Canal de vagas subscrito com sucesso');
          retryCountRef.current = 0; // Reset retry count on success
        }
      });

    // Listener para clientes (baseado em vagas)
    clientesChannelRef.current = supabase
      .channel(`clientes-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vagas' },
        handleClientesChange
      )
      .subscribe((status) => {
        if (isUnmountedRef.current) return;
        
        console.log('[DataProvider] Clientes channel status:', status);
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[DataProvider] Erro no canal de clientes:', status);
          handleChannelError();
        } else if (status === 'SUBSCRIBED') {
          console.log('[DataProvider] ✅ Canal de clientes subscrito com sucesso');
          retryCountRef.current = 0; // Reset retry count on success
        }
      });
  }

  function handleChannelError() {
    if (isUnmountedRef.current) return;

    retryCountRef.current++;
    
    if (retryCountRef.current <= maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Exponential backoff
      console.warn(`[DataProvider] Tentando reconectar em ${delay}ms (tentativa ${retryCountRef.current}/${maxRetries})...`);
      
      setTimeout(() => {
        if (!isUnmountedRef.current) {
          setupRealtimeListeners();
        }
      }, delay);
    } else {
      console.error('[DataProvider] Máximo de tentativas de reconexão atingido. Recarregando dados a cada 30s...');
      // Fallback: recarregar dados periodicamente se realtime falhar
      const intervalId = setInterval(() => {
        if (!isUnmountedRef.current) {
          loadData();
        } else {
          clearInterval(intervalId);
        }
      }, 30000);
    }
  }

  async function handleVagasChange(payload: any) {
    if (isUnmountedRef.current) return;
    
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
    if (isUnmountedRef.current) return;
    
    console.log('[DataProvider] Mudança detectada em clientes (via vagas):', payload.eventType);

    try {
      // Recarregar clientes quando vagas mudam
      const { data: clientesData, error: clientesError } = await supabase
        .from('vagas')
        .select('cliente')
        .not('cliente', 'is', null)
        .order('cliente');

      if (!clientesError && clientesData && !isUnmountedRef.current) {
        const uniqueClientes = [...new Set(clientesData.map(item => item.cliente).filter(Boolean))];
        setClientes(uniqueClientes.map(cliente => ({ nome: cliente })));
      }
    } catch (error) {
      console.error('[DataProvider] Erro ao processar mudança em clientes:', error);
    }
  }

  // Configurar auto-refresh a cada 5 minutos
  useAutoRefresh({
    onRefresh: refresh,
    interval: 300000, // 5 minutos
    enabled: true,
    onVisibilityChange: true
  });

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
