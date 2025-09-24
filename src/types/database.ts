export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'ADMIN' | 'RH';
  created_at: string;
  updated_at: string;
}

export interface Vaga {
  id: string;
  site: string;
  categoria: string;
  cargo: string;
  cliente: string;
  titulo?: string;
  celula: string;
  descricao_vaga?: string;
  responsabilidades_atribuicoes?: string;
  requisitos_qualificacoes?: string;
  salario?: string;
  horario_trabalho?: string;
  jornada_trabalho?: string;
  beneficios?: string;
  local_trabalho?: string;
  etapas_processo?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface BackupLog {
  id: string;
  backup_type: 'manual' | 'automatic' | 'export';
  backup_data?: any;
  file_path?: string;
  status: 'success' | 'failed' | 'pending';
  created_by?: string;
  created_at: string;
}

export interface VagaFormData {
  site: string;
  categoria: string;
  cargo: string;
  cliente: string;
  titulo?: string;
  celula: string;
  descricao_vaga?: string;
  responsabilidades_atribuicoes?: string;
  requisitos_qualificacoes?: string;
  salario?: string;
  horario_trabalho?: string;
  jornada_trabalho?: string;
  beneficios?: string;
  local_trabalho?: string;
  etapas_processo?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'RH';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'RH';
}

// Tipos para filtros e comparação
export interface VagaFilter {
  cliente?: string;
  site?: string;
  categoria?: string;
  cargo?: string;
  celula?: string;
}

export interface ComparisonData {
  clientes: string[];
  vagas: Vaga[];
}

// Tipos para backup
export interface BackupOptions {
  type: 'manual' | 'automatic' | 'export';
  data?: {
    vagas?: boolean;
    users?: boolean;
    backup_logs?: boolean;
  };
  format?: 'json' | 'excel' | 'csv';
}
