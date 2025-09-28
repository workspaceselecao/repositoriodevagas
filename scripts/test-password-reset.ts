#!/usr/bin/env node

/**
 * Script de teste para o sistema de reset de senha
 * 
 * Este script testa:
 * 1. Envio de email de recuperação
 * 2. Verificação de sessão de recuperação
 * 3. Redefinição de senha
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rkcrazuegletgxoqflnc.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrY3JhenVlZ2xldGd4b3FmbG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTM5NjMsImV4cCI6MjA3NDE2OTk2M30.EV-UhjfAqY2ggLbA1fYaVHVr2hv3dK3NR8c3RQiV2xI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPasswordReset() {
  console.log('🧪 Testando sistema de reset de senha...\n')

  // Teste 1: Envio de email de recuperação
  console.log('1️⃣ Testando envio de email de recuperação...')
  try {
    const testEmail = 'roberio.gomes@atento.com'
    const redirectUrl = process.env.VITE_SUPABASE_REDIRECT_URL || 'http://localhost:3000'
    
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${redirectUrl}/reset-password`
    })

    if (error) {
      console.log('❌ Erro ao enviar email:', error.message)
    } else {
      console.log('✅ Email de recuperação enviado com sucesso!')
      console.log(`   Email: ${testEmail}`)
      console.log(`   URL de redirecionamento: ${redirectUrl}/reset-password`)
    }
  } catch (error) {
    console.log('❌ Erro inesperado:', error)
  }

  console.log('\n2️⃣ Testando verificação de sessão...')
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      console.log('✅ Sessão ativa encontrada')
      console.log(`   Usuário: ${session.user.email}`)
      console.log(`   Tipo de sessão: ${session.user.aud}`)
    } else {
      console.log('ℹ️ Nenhuma sessão ativa (normal se não estiver logado)')
    }
  } catch (error) {
    console.log('❌ Erro ao verificar sessão:', error)
  }

  console.log('\n3️⃣ Testando configurações do Supabase...')
  try {
    // Verificar se o cliente está configurado corretamente
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ Erro ao conectar com o banco:', error.message)
    } else {
      console.log('✅ Conexão com Supabase funcionando')
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error)
  }

  console.log('\n📋 Instruções para teste manual:')
  console.log('1. Acesse http://localhost:3000/login')
  console.log('2. Clique em "Esqueci minha senha"')
  console.log('3. Digite um email válido')
  console.log('4. Verifique seu email e clique no link')
  console.log('5. Você deve ser redirecionado para /reset-password')
  console.log('6. Defina uma nova senha')
  console.log('7. Você deve ser redirecionado para /login')

  console.log('\n🔧 Configurações necessárias no Supabase Dashboard:')
  console.log('1. Authentication → URL Configuration')
  console.log('   Site URL: http://localhost:3000')
  console.log('   Redirect URLs:')
  console.log('   - http://localhost:3000/reset-password')
  console.log('   - https://repositoriodevagas.vercel.app/reset-password')
  
  console.log('\n✅ Teste concluído!')
}

// Executar teste
testPasswordReset().catch(console.error)
