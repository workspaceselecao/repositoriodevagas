import { createClient, AuthFlowType, SupabaseClient } from '@supabase/supabase-js'
import { isDbLoadingBlocked as checkDbLoadingBlocked } from './admin-control'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

// Função para verificar se o carregamento está bloqueado
export function isDbLoadingBlocked(): boolean {
  return checkDbLoadingBlocked()
}

// Singleton para evitar múltiplas instâncias
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Configuração comum para evitar múltiplas instâncias
const commonConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce' as AuthFlowType,
    debug: false,
    // Adicionar configuração única para evitar conflitos
    storageKey: 'repositoriodevagas-auth-token'
  },
  global: {
    headers: {
      'X-Client-Info': 'repositoriodevagas-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}

// Cliente padrão (para operações do usuário) - Singleton ULTRA RADICAL
export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('🔧 ULTRA RADICAL: Criando instância única do Supabase client')
    
    // Configuração ULTRA RADICAL para evitar múltiplas instâncias
    const ultraRadicalConfig = {
      ...commonConfig,
      auth: {
        ...commonConfig.auth,
        storageKey: 'repositoriodevagas-ultra-radical-auth',
        autoRefreshToken: false, // Desabilitar auto-refresh para evitar conflitos
        persistSession: false    // Desabilitar persistência para evitar conflitos
      }
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, ultraRadicalConfig) as SupabaseClient
  }
  return supabaseInstance
})()

// Cliente administrativo (para operações que requerem service role) - Singleton
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    console.log('🔧 Criando instância única do Supabase admin client')
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storage: undefined, // Não usar storage para admin
        // Configuração única para admin
        storageKey: 'repositoriodevagas-admin-token'
      },
      global: {
        headers: {
          'X-Client-Info': 'repositoriodevagas-admin'
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 0 // Desabilitar realtime para admin para evitar conflitos
        }
      }
    }) as SupabaseClient
  }
  return supabaseAdminInstance
})()
