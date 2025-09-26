// Utilitários para validação e gerenciamento de senhas

export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  suggestions: string[]
}

export interface PasswordStrength {
  score: number
  label: 'Muito Fraca' | 'Fraca' | 'Regular' | 'Boa' | 'Muito Forte'
  color: 'red' | 'orange' | 'yellow' | 'lightgreen' | 'green'
}

// Senhas comuns que devem ser evitadas
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234', 'dragon',
  'master', 'hello', 'login', 'pass', '123', 'qwerty123',
  'senha', '123456789', 'admin123', 'password1', 'root',
  'toor', 'user', 'guest', 'test', 'demo'
]

// Regex para validações específicas
const PATTERNS = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  numbers: /[0-9]/,
  symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  sequential: /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
  repeated: /(.)\1{2,}/
}

/**
 * Valida a força de uma senha
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // Verificar comprimento
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres')
    suggestions.push('Adicione mais caracteres para aumentar a segurança')
  } else if (password.length >= 12) {
    score += 25
  } else {
    score += 15
  }

  // Verificar se é uma senha comum
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Esta senha é muito comum e fácil de adivinhar')
    suggestions.push('Use uma senha única e personalizada')
    score -= 30
  }

  // Verificar padrões sequenciais
  if (PATTERNS.sequential.test(password)) {
    errors.push('Evite sequências óbvias (123, abc, etc.)')
    suggestions.push('Use caracteres aleatórios')
    score -= 20
  }

  // Verificar caracteres repetidos
  if (PATTERNS.repeated.test(password)) {
    errors.push('Evite caracteres repetidos em sequência')
    suggestions.push('Varie os caracteres da senha')
    score -= 15
  }

  // Verificar tipos de caracteres
  if (PATTERNS.lowercase.test(password)) {
    score += 10
  } else {
    errors.push('Adicione letras minúsculas')
  }

  if (PATTERNS.uppercase.test(password)) {
    score += 10
  } else {
    errors.push('Adicione letras maiúsculas')
  }

  if (PATTERNS.numbers.test(password)) {
    score += 10
  } else {
    errors.push('Adicione números')
  }

  if (PATTERNS.symbols.test(password)) {
    score += 15
  } else {
    suggestions.push('Considere adicionar símbolos especiais (!@#$%^&*)')
  }

  // Verificar diversidade de caracteres
  const uniqueChars = new Set(password).size
  if (uniqueChars >= 8) {
    score += 15
  } else if (uniqueChars >= 5) {
    score += 10
  } else {
    suggestions.push('Use uma maior variedade de caracteres')
  }

  // Garantir que o score não seja negativo
  score = Math.max(0, Math.min(100, score))

  return {
    isValid: errors.length === 0 && score >= 60,
    score,
    errors,
    suggestions
  }
}

/**
 * Retorna informações sobre a força da senha
 */
export function getPasswordStrength(password: string): PasswordStrength {
  const validation = validatePasswordStrength(password)
  
  let label: PasswordStrength['label'] = 'Muito Fraca'
  let color: PasswordStrength['color'] = 'red'

  if (validation.score >= 80) {
    label = 'Muito Forte'
    color = 'green'
  } else if (validation.score >= 65) {
    label = 'Boa'
    color = 'lightgreen'
  } else if (validation.score >= 50) {
    label = 'Regular'
    color = 'yellow'
  } else if (validation.score >= 30) {
    label = 'Fraca'
    color = 'orange'
  }

  return {
    score: validation.score,
    label,
    color
  }
}

/**
 * Gera sugestões de senha segura
 */
export function generatePasswordSuggestions(): string[] {
  const suggestions = [
    'Use pelo menos 8 caracteres',
    'Combine letras maiúsculas e minúsculas',
    'Inclua números e símbolos',
    'Evite informações pessoais',
    'Não reutilize senhas de outros sites',
    'Considere usar uma frase como senha',
    'Exemplo: "MinhaCasa@2024!" ou "Café#Manhã123"'
  ]
  
  return suggestions
}

/**
 * Verifica se duas senhas são iguais
 */
export function passwordsMatch(password1: string, password2: string): boolean {
  return password1 === password2
}

/**
 * Valida se a senha atende aos critérios mínimos
 */
export function isValidPassword(password: string): boolean {
  const validation = validatePasswordStrength(password)
  return validation.isValid
}

/**
 * Gera uma senha temporária segura
 */
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Garantir pelo menos um de cada tipo
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Adicionar caracteres aleatórios para completar 12 caracteres
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Verifica se a senha não está no histórico recente
 */
export function isPasswordInHistory(password: string, history: string[]): boolean {
  return history.some(oldPassword => oldPassword === password)
}

/**
 * Formata a senha para exibição (oculta a maior parte)
 */
export function maskPassword(password: string): string {
  if (password.length <= 2) return '*'.repeat(password.length)
  return password[0] + '*'.repeat(password.length - 2) + password[password.length - 1]
}
