import { supabase } from './supabase'
import { User, AuthUser, LoginFormData, UserFormData } from '../types/database'
import bcrypt from 'bcryptjs'

// Função para fazer login
export async function signIn({ email, password }: LoginFormData): Promise<AuthUser | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Senha incorreta')
    }

    // Retornar dados do usuário (sem a senha)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return null
  }
}

// Função para criar usuário
export async function createUser(userData: UserFormData): Promise<User | null> {
  try {
    // Hash da senha
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return user
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return null
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
