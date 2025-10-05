import { supabase, supabaseAdmin } from './supabase'
import { User, AuthUser, LoginFormData, UserFormData } from '../types/database'
import { validatePasswordStrength, isValidPassword } from './password-utils'
import { filterVisibleUsers, SUPER_ADMIN_EMAIL } from './user-filter'

// Função auxiliar para verificar se email existe no sistema
async function checkIfEmailExists(email: string): Promise<boolean> {
  try {
    // Verificar na tabela users
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()
    
    return !error && !!user
  } catch (error) {
    // Se não encontrou na tabela users, retornar false
    return false
  }
}

// Função para fazer login usando Supabase Auth
export async function signIn({ email, password }: LoginFormData): Promise<AuthUser | null> {
  try {
    console.log('🔐 Autenticando usuário:', email)
    
    // Fazer login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message)
      
      // Verificar se é erro de email não confirmado
      if (authError.message.includes('Email not confirmed') || 
          authError.message.includes('email_not_confirmed') ||
          (authError.message.includes('Invalid login credentials') && 
           await checkIfEmailExists(email))) {
        throw new Error('CONFIRM_EMAIL')
      }
      
      // Outros erros de autenticação
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Usuário não encontrado')
    }

    console.log('✅ Autenticação Supabase bem-sucedida')

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
        console.log('✅ Dados do usuário carregados')
      }
    } catch (userError) {
      console.log('Erro ao buscar usuário na tabela, usando dados do Auth:', userError)
    }

    // Se não encontrou o usuário na tabela, usar dados do Auth
    if (!user) {
      console.log('⚠️ Usuário não encontrado na tabela users, usando dados do Auth')
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário',
        role: authData.user.user_metadata?.role || 'RH' // Role padrão
      }
    }

    console.log('✅ Login concluído com sucesso')
    // Retornar dados do usuário da tabela
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('❌ Erro no login:', error)
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

    // Filtrar usuários ocultos
    const visibleUsers = filterVisibleUsers(users || []) as User[]

    return visibleUsers
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
    // Primeiro, verificar se o usuário existe na tabela users e obter o email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('Usuário não encontrado na base de dados')
    }

    // Usar a mesma lógica do supabase.ts para verificar Service Key
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
    
    // Verificar se temos Service Key válida (não é o placeholder)
    const hasServiceKey = supabaseServiceKey && 
                        supabaseServiceKey !== 'your_supabase_service_role_key_here'

    if (hasServiceKey) {
      try {
        // Buscar todos os usuários no Auth para encontrar o correto
        const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
          console.error('Erro ao listar usuários do Auth:', listError)
          throw new Error('Erro ao acessar sistema de autenticação')
        }

        // Procurar usuário pelo email (mais confiável que ID)
        const authUser = allUsers.users?.find((u: any) => u.email === user.email)
        
        if (authUser) {
          // Usuário existe no Auth, redefinir senha
          console.log('Usuário encontrado no Auth, redefinindo senha...')
          const { error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            password: newPassword
          })

          if (error) {
            console.error('Erro ao redefinir senha:', error)
            throw new Error(`Erro ao redefinir senha: ${error.message}`)
          }

          console.log('✅ Senha redefinida com sucesso')
          return true
        } else {
          // Usuário não existe no Auth, criar
          console.log('Usuário não existe no Supabase Auth, criando...')
          const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: newPassword,
            email_confirm: true,
            user_metadata: {
              full_name: user.name,
              role: 'RH'
            }
          })

          if (createError) {
            console.error('Erro ao criar usuário no Auth:', createError)
            // Se o erro for de email já existente, tentar buscar novamente
            if (createError.message.includes('already been registered')) {
              console.log('Email já existe no Auth, tentando redefinir senha...')
              const existingUser = allUsers.users?.find((u: any) => u.email === user.email)
              if (existingUser) {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                  password: newPassword
                })
                
                if (updateError) {
                  throw new Error(`Erro ao redefinir senha: ${updateError.message}`)
                }
                
                console.log('✅ Senha redefinida com sucesso (usuário existente)')
                return true
              }
            }
            throw new Error(`Erro ao criar usuário no sistema de autenticação: ${createError.message}`)
          }

          console.log('✅ Usuário criado no Supabase Auth com sucesso')
          return true
        }
      } catch (authError: any) {
        console.error('Erro no processo de autenticação:', authError)
        throw new Error(authError.message)
      }
    } else {
      // Implementar método alternativo sem Service Key
      return await resetUserPasswordWithoutAdmin(userId, newPassword)
    }
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    throw error
  }
}

// Método alternativo sem Service Key (usando resetPasswordForEmail)
async function resetUserPasswordWithoutAdmin(userId: string, newPassword: string): Promise<boolean> {
  try {
    // Buscar email do usuário primeiro
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('Usuário não encontrado')
    }

    // Enviar email de redefinição de senha
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      console.error('Erro ao enviar email de redefinição:', error)
      throw new Error('Não foi possível enviar email de redefinição de senha')
    }

    // Como não podemos definir a senha diretamente, vamos retornar false
    // e mostrar uma mensagem explicativa
    throw new Error('Redefinição de senha por email enviada. Verifique sua caixa de entrada.')
  } catch (error) {
    console.error('Erro no método alternativo de redefinição:', error)
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
    supabase.auth.signOut().catch((error: any) => {
      console.warn('Erro ao fazer logout (não crítico):', error)
    })
    
    // Limpar dados locais imediatamente
    if (typeof window !== 'undefined') {
      // Limpeza controlada apenas no logout explícito
      // Preservar sessão para evitar deslogamentos indesejados
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

    // Primeiro, tentar usar dados do Auth se disponíveis
    if (authUser.user_metadata?.role) {
      console.log('Usando dados do Auth (role disponível)')
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
        role: authUser.user_metadata.role
      }
    }

    // Se não tem role no metadata, buscar na tabela users com timeout reduzido
    try {
      const userPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      // Timeout reduzido para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao buscar usuário')), 2000)
      })

      const { data: user, error } = await Promise.race([userPromise, timeoutPromise]) as any

      if (!error && user) {
        console.log('Usuário encontrado na tabela')
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    } catch (tableError) {
      console.log('Erro ao buscar na tabela users:', tableError)
    }

    // Fallback: usar dados do Auth
    console.log('Usando dados do Auth (fallback)')
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
      role: authUser.user_metadata?.role || 'RH'
    }
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return null
  }
}

// ===== NOVAS FUNCIONALIDADES DE RECUPERAÇÃO E ALTERAÇÃO DE SENHA =====

/**
 * Envia email de recuperação de senha
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Por favor, insira um email válido'
      }
    }

    // Enviar email de recuperação usando Supabase Auth
    const redirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL || 
                       (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://repositoriodevagas.vercel.app')
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/reset-password`
    })

    if (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      
      // Tratar erros específicos
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          message: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        }
      }
      
      if (error.message.includes('not found')) {
        // Por segurança, não revelar se o email existe ou não
        return {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um link de recuperação em alguns minutos.'
        }
      }
      
      return {
        success: false,
        message: 'Erro ao enviar email de recuperação. Tente novamente.'
      }
    }

    // Sempre retornar sucesso para não revelar se o email existe
    return {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação em alguns minutos.'
    }
  } catch (error) {
    console.error('Erro inesperado ao enviar email de recuperação:', error)
    return {
      success: false,
      message: 'Erro inesperado. Tente novamente mais tarde.'
    }
  }
}

/**
 * Atualiza a senha do usuário logado
 */
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validar força da senha
    if (!isValidPassword(newPassword)) {
      const validation = validatePasswordStrength(newPassword)
      return {
        success: false,
        message: `Senha muito fraca. ${validation.errors.join(', ')}`
      }
    }

    // Atualizar senha usando Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      
      if (error.message.includes('same')) {
        return {
          success: false,
          message: 'A nova senha deve ser diferente da senha atual.'
        }
      }
      
      return {
        success: false,
        message: 'Erro ao atualizar senha. Tente novamente.'
      }
    }

    return {
      success: true,
      message: 'Senha atualizada com sucesso!'
    }
  } catch (error) {
    console.error('Erro inesperado ao atualizar senha:', error)
    return {
      success: false,
      message: 'Erro inesperado. Tente novamente mais tarde.'
    }
  }
}

/**
 * Redefine a senha usando o token de recuperação
 */
export async function resetPasswordWithToken(newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validar força da senha
    if (!isValidPassword(newPassword)) {
      const validation = validatePasswordStrength(newPassword)
      return {
        success: false,
        message: `Senha muito fraca. ${validation.errors.join(', ')}`
      }
    }

    // Atualizar senha usando Supabase Auth (funciona com token de recuperação)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Erro ao redefinir senha:', error)
      
      if (error.message.includes('session')) {
        return {
          success: false,
          message: 'Link de recuperação expirado ou inválido. Solicite um novo link.'
        }
      }
      
      return {
        success: false,
        message: 'Erro ao redefinir senha. Tente novamente.'
      }
    }

    return {
      success: true,
      message: 'Senha redefinida com sucesso! Você será redirecionado para o login.'
    }
  } catch (error) {
    console.error('Erro inesperado ao redefinir senha:', error)
    return {
      success: false,
      message: 'Erro inesperado. Tente novamente mais tarde.'
    }
  }
}

/**
 * Verifica se há uma sessão de recuperação de senha ativa
 */
export async function hasPasswordRecoverySession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Verificar se é uma sessão de recuperação válida
    // Uma sessão de recuperação tem user e access_token, mas pode não ter refresh_token completo
    if (session?.user && session.access_token) {
      // Verificar se estamos na página de reset
      const isOnResetPage = window.location.pathname === '/reset-password'
      
      if (isOnResetPage) {
        console.log('Sessão de recuperação válida detectada')
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Erro ao verificar sessão de recuperação:', error)
    return false
  }
}

/**
 * Valida se o usuário pode alterar a senha (verifica senha atual)
 */
export async function validateCurrentPassword(currentPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      return {
        success: false,
        message: 'Usuário não encontrado.'
      }
    }

    // Tentar fazer login com a senha atual para validar
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          message: 'Senha atual incorreta.'
        }
      }
      
      return {
        success: false,
        message: 'Erro ao validar senha atual. Tente novamente.'
      }
    }

    return {
      success: true,
      message: 'Senha atual válida.'
    }
  } catch (error) {
    console.error('Erro ao validar senha atual:', error)
    return {
      success: false,
      message: 'Erro inesperado. Tente novamente mais tarde.'
    }
  }
}

/**
 * Logout e redirecionamento após alteração de senha
 */
export async function logoutAndRedirect(): Promise<void> {
  try {
    // Fazer logout
    await signOut()
    
    // Redirecionar para login após um pequeno delay
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  } catch (error) {
    console.error('Erro durante logout:', error)
    // Mesmo com erro, tentar redirecionar
    window.location.href = '/login'
  }
}
