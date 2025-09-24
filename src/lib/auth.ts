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
    // Usar try-catch para evitar problemas de RLS
    let user = null
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (!userError && userData) {
        user = userData
      }
    } catch (userError) {
      console.log('Erro ao buscar usuário na tabela, usando dados do Auth:', userError)
    }

    // Se não encontrou o usuário na tabela, usar dados do Auth
    if (!user) {
      console.log('Usuário não encontrado na tabela users, usando dados do Auth')
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário',
        role: authData.user.user_metadata?.role || 'RH' // Role padrão
      }
    }

    // Retornar dados do usuário da tabela
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
    // Verificar se temos Service Key disponível
    const hasServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY && 
                        import.meta.env.VITE_SUPABASE_SERVICE_KEY !== 'your_supabase_service_role_key_here'

    if (hasServiceKey) {
      // Usar método administrativo se Service Key estiver disponível
      return await createUserWithAdmin(userData)
    } else {
      // Usar método alternativo sem Service Key
      return await createUserWithoutAdmin(userData)
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    throw error // Re-throw para que o componente possa capturar
  }
}

// Método administrativo (requer Service Key)
async function createUserWithAdmin(userData: UserFormData): Promise<User | null> {
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
    console.error('Erro no método administrativo:', error)
    throw error
  }
}

// Método alternativo sem Service Key (usando signUp)
async function createUserWithoutAdmin(userData: UserFormData): Promise<User | null> {
  try {
    // Criar usuário usando signUp (método público)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          role: userData.role
        }
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário no Auth')
    }

    // Criar registro na tabela users usando cliente padrão
    const { data: user, error: userError } = await supabase
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
      throw new Error(userError.message)
    }

    return user
  } catch (error) {
    console.error('Erro no método alternativo:', error)
    throw error
  }
}

// Função para verificar se o usuário é admin
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN'
}

// Função para listar todos os usuários (apenas para admins)
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      throw new Error(error.message)
    }

    return users || []
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    throw error
  }
}

// Função para atualizar usuário
export async function updateUser(userId: string, userData: Partial<UserFormData>): Promise<User | null> {
  try {
    const updateData: any = {}
    
    if (userData.name) updateData.name = userData.name
    if (userData.email) updateData.email = userData.email
    if (userData.role) updateData.role = userData.role

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw new Error(error.message)
    }

    return user
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    throw error
  }
}

// Função para excluir usuário
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // Verificar se temos Service Key disponível para excluir do Auth
    const hasServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY && 
                        import.meta.env.VITE_SUPABASE_SERVICE_KEY !== 'your_supabase_service_role_key_here'

    if (hasServiceKey) {
      // Excluir do Supabase Auth usando cliente administrativo
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('Erro ao excluir usuário do Auth:', authError)
        throw new Error(authError.message)
      }
    }

    // Excluir da tabela users
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Erro ao excluir usuário da tabela:', userError)
      throw new Error(userError.message)
    }

    return true
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    throw error
  }
}

// Função para redefinir senha de usuário
export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const hasServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY && 
                        import.meta.env.VITE_SUPABASE_SERVICE_KEY !== 'your_supabase_service_role_key_here'

    if (hasServiceKey) {
      // Redefinir senha usando cliente administrativo
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      })

      if (error) {
        console.error('Erro ao redefinir senha:', error)
        throw new Error(error.message)
      }

      return true
    } else {
      throw new Error('Service Key não disponível para redefinir senha')
    }
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    throw error
  }
}

// Função para verificar se o usuário é RH ou Admin
export function canManageUsers(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'RH'
}

// Função para verificar se o usuário pode acessar configurações
export function canAccessSettings(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN'
}

// Função para fazer logout otimizada
export async function signOut(): Promise<void> {
  try {
    // Fazer logout de forma assíncrona sem aguardar
    supabase.auth.signOut().catch(error => {
      console.warn('Erro ao fazer logout (não crítico):', error)
    })
    
    // Limpar cache local imediatamente
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      localStorage.removeItem('supabase.auth.token')
      // Limpar chaves do Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key)
        }
      })
      
      // Limpar sessionStorage
      sessionStorage.clear()
      
      // Limpar cache do navegador se possível
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('supabase') || name.includes('auth')) {
              caches.delete(name)
            }
          })
        }).catch(() => {
          // Ignorar erros de cache
        })
      }
    }
  } catch (error) {
    console.warn('Erro durante logout (não crítico):', error)
  }
}

// Função para verificar sessão atual
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Verificar se há sessão ativa primeiro
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError)
      return null
    }
    
    if (!session || !session.user) {
      console.log('Nenhuma sessão ativa encontrada')
      return null
    }

    const authUser = session.user

    // Buscar dados do usuário na tabela users com timeout
    const userPromise = supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // Adicionar timeout para evitar travamento
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao buscar usuário')), 5000)
    })

    const { data: user, error } = await Promise.race([userPromise, timeoutPromise]) as any

    if (error || !user) {
      console.log('Usuário não encontrado na tabela, usando dados do Auth')
      // Se não encontrou na tabela, usar dados do Auth
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
        role: authUser.user_metadata?.role || 'RH'
      }
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
