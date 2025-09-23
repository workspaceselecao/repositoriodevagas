import { supabase, supabaseAdmin } from './supabase'
import { User, AuthUser, LoginFormData, UserFormData } from '../types/database'

// Função para fazer login usando Supabase Auth
export async function signIn({ email, password }: LoginFormData): Promise<AuthUser | null> {
  try {
    // Fazer login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Erro de autenticação:', authError.message)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Usuário não encontrado')
    }

    // Buscar dados do usuário na tabela users usando o ID do auth
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError.message)
      console.error('Detalhes do erro:', userError)
      // Se não encontrar o usuário na tabela, criar um registro básico
      if (userError.code === 'PGRST116') {
        console.log('Usuário não encontrado na tabela users, criando registro...')
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário',
            role: 'RH' // Role padrão
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Erro ao criar usuário:', createError)
          throw new Error('Erro ao criar perfil do usuário')
        }
        
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
      throw new Error('Dados do usuário não encontrados')
    }

    if (!user) {
      throw new Error('Usuário não encontrado na base de dados')
    }

    // Retornar dados do usuário
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Erro no login:', error)
    throw error // Re-throw para que o AuthContext possa capturar
  }
}

// Função para criar usuário usando Supabase Auth
export async function createUser(userData: UserFormData): Promise<User | null> {
  try {
    // Criar usuário no Supabase Auth usando cliente administrativo
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário no Auth')
    }

    // Criar registro na tabela users usando cliente administrativo
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password_hash: '' // Não precisamos mais do hash
      })
      .select()
      .single()

    if (userError) {
      console.error('Erro ao criar usuário na tabela:', userError)
      // Se falhou, remover o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(userError.message)
    }

    return user
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    throw error // Re-throw para que o componente possa capturar
  }
}

// Função para verificar se o usuário é admin
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN'
}

// Função para verificar se o usuário é RH ou Admin
export function canManageUsers(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'RH'
}

// Função para verificar se o usuário pode acessar configurações
export function canAccessSettings(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN'
}

// Função para fazer logout
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// Função para verificar sessão atual
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    // Buscar dados do usuário na tabela users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return null
  }
}
