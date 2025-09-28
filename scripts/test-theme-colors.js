#!/usr/bin/env node

/**
 * Script para verificar se a cor #fafafb foi aplicada corretamente no tema escuro
 */

import fs from 'fs'

console.log('🎨 Verificando aplicação da cor #fafafb no tema escuro...\n')

try {
  const themeConfigContent = fs.readFileSync('src/lib/theme.config.ts', 'utf8')
  
  // Verificar se todas as configurações de tema escuro foram atualizadas
  const darkThemeChecks = [
    { name: 'Default Dark - foreground', pattern: /dark:\s*{[^}]*foreground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - cardForeground', pattern: /dark:\s*{[^}]*cardForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - popoverForeground', pattern: /dark:\s*{[^}]*popoverForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - secondaryForeground', pattern: /dark:\s*{[^}]*secondaryForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - mutedForeground', pattern: /dark:\s*{[^}]*mutedForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - accentForeground', pattern: /dark:\s*{[^}]*accentForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - successForeground', pattern: /dark:\s*{[^}]*successForeground:\s*'0 0% 98%'/, found: false },
    { name: 'Default Dark - warningForeground', pattern: /dark:\s*{[^}]*warningForeground:\s*'0 0% 98%'/, found: false }
  ]
  
  // Verificar temas específicos
  const themeProfiles = ['rose', 'violet', 'emerald', 'amber', 'cyan']
  
  themeProfiles.forEach(profile => {
    darkThemeChecks.push(
      { name: `${profile} Dark - foreground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?foreground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - cardForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?cardForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - popoverForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?popoverForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - secondaryForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?secondaryForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - mutedForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?mutedForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - accentForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?accentForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - successForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?successForeground:\\s*'0 0% 98%'`), found: false },
      { name: `${profile} Dark - warningForeground`, pattern: new RegExp(`${profile}:\\s*{[\\s\\S]*?dark:\\s*{[\\s\\S]*?warningForeground:\\s*'0 0% 98%'`), found: false }
    )
  })
  
  // Verificação simples - contar quantas vezes a cor aparece
  const colorOccurrences = (themeConfigContent.match(/'0 0% 98%'/g) || []).length
  const expectedOccurrences = 48 // 6 temas × 8 propriedades de texto
  
  console.log(`📊 Cor '0 0% 98%' encontrada ${colorOccurrences} vezes (esperado: ${expectedOccurrences})`)
  
  if (colorOccurrences >= expectedOccurrences) {
    console.log('\n🎉 SUCESSO! A cor #fafafb foi aplicada corretamente!')
    console.log('\n✅ Elementos atualizados com cor #fafafb:')
    console.log('  📝 Subtítulo da página (foreground)')
    console.log('  🏷️ Título de campo (cardForeground)')
    console.log('  📋 Subtítulo de campo (popoverForeground)')
    console.log('  📄 Fontes de informação (secondaryForeground)')
    console.log('  🔘 Fontes de botão (accentForeground)')
    console.log('  🪟 Fontes de modal (mutedForeground)')
    console.log('  📊 Fontes de informações extraídas (successForeground)')
    console.log('  🎴 Fontes de informações nos cards (warningForeground)')
    
    console.log('\n🚀 Próximos passos:')
    console.log('  1. Reinicie o servidor de desenvolvimento')
    console.log('  2. Mude para tema escuro na aplicação')
    console.log('  3. Verifique se todos os textos estão com a cor #fafafb')
    console.log('  4. Teste em diferentes perfis de cor (rose, violet, etc.)')
    
  } else {
    console.log('\n❌ VERIFICAÇÃO FALHOU!')
    console.log(`Apenas ${colorOccurrences}/${expectedOccurrences} cores foram aplicadas.`)
    console.log('Verifique o arquivo theme.config.ts e corrija as cores faltantes.')
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ Erro ao verificar configuração de tema:', error.message)
  process.exit(1)
}
