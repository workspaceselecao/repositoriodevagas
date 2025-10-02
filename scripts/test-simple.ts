// Script simplificado para testar o problema específico
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDAzMjQsImV4cCI6MjA3NDE3NjMyNH0._9AMjjkQnDam-ciD9r07X4IpiWG2Hl0jBrFcY-v61Wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSimple() {
  console.log('🔍 Teste simplificado do problema...')
  
  try {
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'roberio.gomes@atento.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message)
      return
    }
    
    console.log('✅ Login OK')
    
    // Teste direto
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      console.error('Código:', error.code)
    } else {
      console.log('✅ Dados:', data?.length || 0)
    }
    
  } catch (error) {
    console.error('💥 Erro:', error)
  }
}

testSimple()
