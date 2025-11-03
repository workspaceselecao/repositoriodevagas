import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🚀 Populando banco de dados...');
console.log('');

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function popular() {
  try {
    console.log('📖 Lendo REPOSITORIO.json...');
    const jsonData = readFileSync('REPOSITORIO.json', 'utf-8');
    const vagas = JSON.parse(jsonData);
    console.log(`✅ Total de vagas: ${vagas.length}`);
    
    const vagasToInsert = vagas.map(vaga => ({
      site: vaga.SITE || null,
      categoria: vaga.CATEGORIA || null,
      cargo: vaga.CARGO || null,
      cliente: vaga.CLIENTE || null,
      titulo: null,
      celula: vaga.PRODUTO || null,
      descricao_vaga: vaga['Descrição da vaga'] || null,
      responsabilidades_atribuicoes: vaga['Responsabilidades e atribuições'] || null,
      requisitos_qualificacoes: vaga['Requisitos e qualificações'] || null,
      salario: vaga['Salário'] || null,
      horario_trabalho: vaga['Horário de Trabalho'] || null,
      jornada_trabalho: vaga['Jornada de Trabalho'] || null,
      beneficios: vaga.Benefícios || null,
      local_trabalho: vaga['Local de Trabalho'] || null,
      etapas_processo: vaga['Etapas do processo'] || null
    }));
    
    console.log('📝 Inserindo em lotes de 5...');
    let total = 0;
    const batchSize = 5;
    
    for (let i = 0; i < vagasToInsert.length; i += batchSize) {
      const batch = vagasToInsert.slice(i, i + batchSize);
      const lote = Math.floor(i / batchSize) + 1;
      const totalLotes = Math.ceil(vagasToInsert.length / batchSize);
      
      const { data, error } = await supabase
        .from('vagas')
        .insert(batch)
        .select();
      
      if (error) {
        console.log(`❌ Lote ${lote}/${totalLotes}: ${error.message}`);
      } else {
        const inseridas = data?.length || 0;
        total += inseridas;
        console.log(`✅ Lote ${lote}/${totalLotes}: ${inseridas} vagas`);
      }
    }
    
    console.log('');
    console.log('🎉 População concluída!');
    console.log(`📊 Total inserido: ${total} vagas`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

popular();

