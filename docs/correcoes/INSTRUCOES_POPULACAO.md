# 🚀 Instruções para Popular o Banco de Dados

## ✅ Pronto para Usar!

Todas as correções foram aplicadas. O sistema está pronto para popular o banco de dados.

## 📋 Pré-requisitos

1. ✅ Banco de dados Supabase configurado
2. ✅ Tabelas criadas (execute `database/schema.sql` no SQL Editor do Supabase)
3. ✅ Credenciais corretas configuradas nos scripts
4. ✅ Arquivo `REPOSITORIO.json` presente na raiz do projeto

## 🎯 Passo a Passo

### 1. Verificar Estrutura do Banco

Execute o schema SQL no Supabase Dashboard:
```bash
# No Supabase Dashboard:
# 1. Acesse: SQL Editor
# 2. Cole o conteúdo de: database/schema.sql
# 3. Execute o script
```

### 2. Testar Conexão

```bash
npm run test-populate
```

Este comando irá:
- ✅ Testar conectividade com o banco
- ✅ Verificar estrutura da tabela `vagas`
- ✅ Validar transformação de dados do JSON
- ✅ Mostrar estatísticas de vagas existentes

**Saída esperada:**
```
🧪 Testando população de vagas...
==================================================
📡 Testando conexão...
✅ Conexão OK
🔍 Verificando estrutura da tabela...
✅ Estrutura da tabela OK
📋 Campos disponíveis: id, site, categoria, cargo, cliente, celula, titulo, ...
📖 Lendo REPOSITORIO.json...
📊 Total de vagas no JSON: 269
🔄 Testando transformação de dados...
✅ Transformação OK
📝 Vaga de teste: { site: 'URUGUAI', cargo: 'ESPECIALISTA I', cliente: 'REDE', celula: 'REDE - LINHA DIRETA' }
🔢 Verificando vagas existentes...
📊 Vagas existentes: 0

✅ Teste concluído com sucesso!

📌 Próximos passos:
   - Execute: npm run populate-vagas
   - Ou execute: npm run reset-vagas (para resetar e popular)
```

### 3. Popular Banco de Dados

**Opção A: Popular sem resetar (recomendado)**
```bash
npm run populate-vagas
```

**Opção B: Resetar tudo e popular**
```bash
npm run reset-vagas
```

**Saída esperada:**
```
📋 Populando tabela de vagas...
==================================================
📖 Lendo arquivo REPOSITORIO.json...
📊 Encontradas 269 vagas no arquivo
🔄 Inserindo vagas no banco de dados...
📝 Inserindo lote 1/54...
✅ Lote 1 inserido com sucesso (5 vagas)
📝 Inserindo lote 2/54...
✅ Lote 2 inserido com sucesso (5 vagas)
...
🎉 População concluída!
📊 Total de vagas inseridas: 269

📊 Estatísticas:
   Clientes únicos: 12
   Sites únicos: 15
   Categorias únicas: 3
```

### 4. Verificar Resultados

```bash
npm run check-vagas
```

## 🔍 Resolução de Problemas

### Erro: "Campo 'celula' não encontrado"
**Causa:** Tabela não tem o campo `celula`  
**Solução:** Execute o `database/schema.sql` completo no Supabase

### Erro: "RLS policy violation"
**Causa:** Script usando anon key em vez de service key  
**Solução:** Scripts já corrigidos para usar service key

### Erro: "Invalid credentials"
**Causa:** Credenciais do Supabase incorretas  
**Solução:** Verifique as credenciais em:
- `src/lib/supabase.ts`
- `scripts/populate-vagas.ts`

### Erro: "REPOSITORIO.json não encontrado"
**Causa:** Arquivo ausente na raiz  
**Solução:** Verifique se `REPOSITORIO.json` está na raiz do projeto

## 📊 Estrutura de Dados

### Campos Mapeados

| JSON | Banco de Dados | Tipo | Obrigatório |
|------|---------------|------|-------------|
| SITE | site | VARCHAR(255) | ✅ |
| CATEGORIA | categoria | VARCHAR(255) | ✅ |
| CARGO | cargo | VARCHAR(255) | ✅ |
| CLIENTE | cliente | VARCHAR(255) | ✅ |
| PRODUTO | **celula** | VARCHAR(255) | ✅ |
| - | titulo | VARCHAR(255) | ❌ |
| Descrição da vaga | descricao_vaga | TEXT | ❌ |
| Responsabilidades... | responsabilidades_atribuicoes | TEXT | ❌ |
| Requisitos... | requisitos_qualificacoes | TEXT | ❌ |
| Salário | salario | VARCHAR(255) | ❌ |
| Horário de Trabalho | horario_trabalho | VARCHAR(255) | ❌ |
| Jornada de Trabalho | jornada_trabalho | VARCHAR(255) | ❌ |
| Benefícios | beneficios | TEXT | ❌ |
| Local de Trabalho | local_trabalho | TEXT | ❌ |
| Etapas do processo | etapas_processo | TEXT | ❌ |

### ⚠️ IMPORTANTE: Campo `celula`

O campo `celula` é **obrigatório** no banco de dados. O script faz o mapeamento automático:
- JSON: `PRODUTO` → Banco: `celula`

## 🔐 Segurança

### Service Key vs Anon Key

**Scripts de População:**
- ✅ Usam **Service Key** (ignora RLS)
- ✅ Podem inserir dados sem autenticação
- ⚠️ Nunca expor publicamente

**Aplicação Frontend:**
- ✅ Usa **Anon Key** (respeita RLS)
- ✅ Requer autenticação de usuário
- ✅ Políticas de segurança aplicadas

### RLS Policies

**Visualização:** Qualquer usuário autenticado  
**Inserção:** RH e ADMIN  
**Atualização:** RH e ADMIN  
**Exclusão:** Apenas ADMIN  
**Admin Soberano:** Controle total

## 📝 Comandos Disponíveis

```bash
# Testar estrutura e conectividade
npm run test-populate

# Popular banco de dados
npm run populate-vagas

# Resetar e popular
npm run reset-vagas

# Verificar vagas existentes
npm run check-vagas

# Criar usuário de teste
npm run create-user

# Configurar Supabase
npm run setup-supabase
```

## 🎉 Pronto!

Após popular o banco, você pode:

1. ✅ Acessar a aplicação: `npm run dev`
2. ✅ Fazer login com: `roberio.gomes@atento.com` / `admin123`
3. ✅ Visualizar vagas populadas no dashboard
4. ✅ Testar funcionalidades de busca e comparação

---

**Última atualização:** $(date)
**Status:** ✅ Pronto para produção

