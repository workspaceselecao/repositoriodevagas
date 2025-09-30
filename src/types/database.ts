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

// Tipos para notícias
export interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'info' | 'alerta' | 'anuncio';
  ativa: boolean;
  prioridade: 'baixa' | 'media' | 'alta';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface NoticiaFormData {
  titulo: string;
  conteudo: string;
  tipo: 'info' | 'alerta' | 'anuncio';
  ativa: boolean;
  prioridade: 'baixa' | 'media' | 'alta';
}

// Tipos para backup
export interface BackupOptions {
  type: 'manual' | 'automatic' | 'export';
  data?: {
    vagas?: boolean;
    users?: boolean;
    backup_logs?: boolean;
    noticias?: boolean;
  };
  format?: 'json' | 'excel' | 'csv';
}

// Tipos para configuração de emails de contato
export interface ContactEmailConfig {
  id: string;
  email: string;
  nome?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactEmailFormData {
  email: string;
  nome?: string;
  ativo?: boolean;
}

// Tipos para configuração de EmailJS
export interface EmailJSConfig {
  id?: string;
  service_id: string;
  template_id: string;
  public_key: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailJSFormData {
  service_id: string;
  template_id: string;
  public_key: string;
  ativo?: boolean;
}
