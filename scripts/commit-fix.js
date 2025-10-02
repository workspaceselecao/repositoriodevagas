const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando commit das correções de cache...');

try {
    // Verificar se estamos em um repositório git
    execSync('git status', { stdio: 'pipe' });
    
    // Adicionar todos os arquivos
    console.log('📁 Adicionando arquivos ao staging...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Verificar status
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
        console.log('✅ Nenhuma mudança para commitar');
        return;
    }
    
    // Fazer commit
    console.log('💾 Fazendo commit...');
    const commitMessage = `🔧 Fix: Corrige loop infinito de cache

- Simplifica CacheContext removendo cache persistente problemático
- Desabilita verificação automática de atualizações no useUpdateCheck  
- Remove múltiplos useEffect que causavam loops infinitos
- Cria scripts de limpeza de cache (clear-cache.js, fix-cache-loop.html)
- Adiciona documentação completa das correções (CORRECAO_LOOP_CACHE.md)
- Melhora performance e estabilidade do sistema

Resolves: Loop infinito de carregamento e cache persistente`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Push para o repositório remoto
    console.log('🚀 Fazendo push para o repositório remoto...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Commit e push realizados com sucesso!');
    
    // Mostrar últimos commits
    console.log('\n📋 Últimos commits:');
    execSync('git log --oneline -5', { stdio: 'inherit' });
    
} catch (error) {
    console.error('❌ Erro durante o processo:', error.message);
    process.exit(1);
}
