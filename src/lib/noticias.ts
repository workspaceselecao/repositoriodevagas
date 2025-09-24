import { supabase } from './supabase'

export interface Noticia {
  id: string
  titulo: string
  conteudo: string
  tipo: 'info' | 'alerta' | 'anuncio'
  ativa: boolean
  prioridade: 'baixa' | 'media' | 'alta'
  created_at: string
  updated_at: string
  created_by: string
}

export interface NoticiaFormData {
  titulo: string
  conteudo: string
  tipo: 'info' | 'alerta' | 'anuncio'
  ativa: boolean
  prioridade: 'baixa' | 'media' | 'alta'
}

// Função para listar todas as notícias
export async function getNoticias(): Promise<Noticia[]> {
  try {
    const { data: noticias, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar notícias:', error)
      throw new Error(error.message)
    }

    return noticias || []
  } catch (error) {
    console.error('Erro ao listar notícias:', error)
    throw error
  }
}

// Função para buscar notícia por ID
export async function getNoticiaById(id: string): Promise<Noticia | null> {
  try {
    const { data: noticia, error } = await supabase
      .from('noticias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar notícia:', error)
      throw new Error(error.message)
    }

    return noticia
  } catch (error) {
    console.error('Erro ao buscar notícia:', error)
    throw error
  }
}

// Função para criar nova notícia
export async function createNoticia(noticiaData: NoticiaFormData, userId: string): Promise<Noticia | null> {
  try {
    const { data: noticia, error } = await supabase
      .from('noticias')
      .insert({
        titulo: noticiaData.titulo,
        conteudo: noticiaData.conteudo,
        tipo: noticiaData.tipo,
        ativa: noticiaData.ativa,
        prioridade: noticiaData.prioridade,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar notícia:', error)
      throw new Error(error.message)
    }

    return noticia
  } catch (error) {
    console.error('Erro ao criar notícia:', error)
    throw error
  }
}

// Função para atualizar notícia
export async function updateNoticia(id: string, noticiaData: Partial<NoticiaFormData>): Promise<Noticia | null> {
  try {
    const updateData: any = {}
    
    if (noticiaData.titulo !== undefined) updateData.titulo = noticiaData.titulo
    if (noticiaData.conteudo !== undefined) updateData.conteudo = noticiaData.conteudo
    if (noticiaData.tipo !== undefined) updateData.tipo = noticiaData.tipo
    if (noticiaData.ativa !== undefined) updateData.ativa = noticiaData.ativa
    if (noticiaData.prioridade !== undefined) updateData.prioridade = noticiaData.prioridade

    const { data: noticia, error } = await supabase
      .from('noticias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar notícia:', error)
      throw new Error(error.message)
    }

    return noticia
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error)
    throw error
  }
}

// Função para excluir notícia
export async function deleteNoticia(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('noticias')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir notícia:', error)
      throw new Error(error.message)
    }

    return true
  } catch (error) {
    console.error('Erro ao excluir notícia:', error)
    throw error
  }
}

// Função para ativar/desativar notícia
export async function toggleNoticiaStatus(id: string, ativa: boolean): Promise<Noticia | null> {
  try {
    const { data: noticia, error } = await supabase
      .from('noticias')
      .update({ ativa })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao alterar status da notícia:', error)
      throw new Error(error.message)
    }

    return noticia
  } catch (error) {
    console.error('Erro ao alterar status da notícia:', error)
    throw error
  }
}

// Função para buscar notícias ativas
export async function getNoticiasAtivas(): Promise<Noticia[]> {
  try {
    const { data: noticias, error } = await supabase
      .from('noticias')
      .select('*')
      .eq('ativa', true)
      .order('prioridade', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar notícias ativas:', error)
      throw new Error(error.message)
    }

    return noticias || []
  } catch (error) {
    console.error('Erro ao buscar notícias ativas:', error)
    throw error
  }
}
