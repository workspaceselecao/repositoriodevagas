import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { useThemeClasses } from '../hooks/useThemeClasses'
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  ChevronRight,
  Filter,
  X,
  Lightbulb,
  Settings,
  Users,
  BarChart3,
  Plus,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Copy
} from 'lucide-react'
// import { toast } from 'sonner' // Removido para evitar dependência extra

interface HelpContent {
  id: string
  title: string
  content: string
  category: string
  type: 'manual' | 'faq'
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  icon: string
}

interface SearchResult {
  content: HelpContent
  relevance: number
  matchedText: string[]
}

export default function TiraDuvidas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState<'all' | 'manual' | 'faq'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { textClasses } = useThemeClasses()

  // Base de conhecimento estruturada
  const helpContent: HelpContent[] = [
    // Manual - Autenticação
    {
      id: 'auth-login',
      title: 'Como fazer login no sistema',
      content: '1. Acesse a URL da aplicação no seu navegador\n2. Insira seu email e senha\n3. Clique em "Entrar"\n4. Aguarde a validação das credenciais\n5. Você será redirecionado automaticamente para o dashboard',
      category: 'autenticacao',
      type: 'manual',
      tags: ['login', 'acesso', 'entrada', 'credenciais'],
      priority: 'high',
      icon: '🔐'
    },
    {
      id: 'auth-recovery',
      title: 'Recuperação de senha',
      content: '1. Na página de login, clique em "Esqueci minha senha"\n2. Insira seu email cadastrado\n3. Clique em "Enviar link de recuperação"\n4. Verifique sua caixa de email\n5. Clique no link recebido\n6. Defina uma nova senha',
      category: 'autenticacao',
      type: 'manual',
      tags: ['senha', 'recuperação', 'esqueci', 'reset'],
      priority: 'high',
      icon: '🔑'
    },
    
    // Manual - Gestão de Vagas
    {
      id: 'vagas-criar',
      title: 'Criar uma nova vaga',
      content: '1. Acesse "Nova Vaga" no menu lateral\n2. Preencha todas as informações obrigatórias (Site, Categoria, Cargo, Cliente, Descrição)\n3. Use o sistema de scraping para extrair dados de URLs\n4. Revise as informações extraídas\n5. Clique em "Criar Oportunidade"',
      category: 'vagas',
      type: 'manual',
      tags: ['criar', 'vaga', 'nova', 'oportunidade', 'formulário'],
      priority: 'high',
      icon: '➕'
    },
    {
      id: 'vagas-editar',
      title: 'Editar uma vaga existente',
      content: '1. Na lista de vagas, clique no ícone "Editar" (✏️)\n2. Modifique os campos desejados\n3. Clique em "Salvar alterações"\n4. Confirme a operação\n\nO sistema mantém um histórico de todas as alterações realizadas.',
      category: 'vagas',
      type: 'manual',
      tags: ['editar', 'modificar', 'alterar', 'atualizar'],
      priority: 'high',
      icon: '✏️'
    },
    {
      id: 'vagas-buscar',
      title: 'Buscar vagas específicas',
      content: 'Use o campo de busca na página de oportunidades para procurar por:\n• Cliente\n• Cargo\n• Site\n• Célula\n• Título\n\nUse filtros avançados para refinar os resultados.',
      category: 'vagas',
      type: 'manual',
      tags: ['buscar', 'procurar', 'filtrar', 'pesquisar'],
      priority: 'medium',
      icon: '🔍'
    },
    {
      id: 'vagas-scraping',
      title: 'Sistema de scraping automático',
      content: 'O sistema pode extrair automaticamente informações de vagas:\n1. Cole a URL da vaga no campo apropriado\n2. Clique em "Extrair Informações"\n3. Revise e ajuste as informações extraídas\n4. Salve a vaga\n\nFunciona com a maioria dos sites de vagas.',
      category: 'vagas',
      type: 'manual',
      tags: ['scraping', 'extrair', 'url', 'automático'],
      priority: 'medium',
      icon: '🤖'
    },

    // Manual - Comparativo
    {
      id: 'comparativo-usar',
      title: 'Como usar o comparativo de clientes',
      content: '1. Acesse "Comparativo" no menu lateral\n2. Selecione até 3 clientes para comparação\n3. Aplique filtros conforme necessário (Célula → Cargo → Site → Categoria)\n4. Visualize a comparação lado a lado\n5. Expanda detalhes clicando nas seções',
      category: 'comparativo',
      type: 'manual',
      tags: ['comparar', 'clientes', 'filtros', 'análise'],
      priority: 'high',
      icon: '📊'
    },
    {
      id: 'comparativo-filtros',
      title: 'Filtros no comparativo',
      content: 'Os filtros são condicionais e funcionam em cascata:\n• Célula: Filtro principal que afeta outros filtros\n• Cargo: Depende da célula selecionada\n• Site: Depende de célula e cargo\n• Categoria: Depende dos filtros anteriores\n\nUse "Limpar Filtros" para resetar.',
      category: 'comparativo',
      type: 'manual',
      tags: ['filtros', 'condicionais', 'cascata', 'limpar'],
      priority: 'medium',
      icon: '🔧'
    },

    // FAQ - Problemas Técnicos
    {
      id: 'faq-lento',
      title: 'A aplicação está lenta. O que fazer?',
      content: '• Verifique sua conexão com a internet\n• Limpe o cache do navegador\n• Feche outras abas desnecessárias\n• Entre em contato com o administrador se o problema persistir\n\nO sistema é otimizado para até 10.000 vagas.',
      category: 'problemas',
      type: 'faq',
      tags: ['lento', 'performance', 'cache', 'internet'],
      priority: 'high',
      icon: '⚡'
    },
    {
      id: 'faq-acesso',
      title: 'Não consigo acessar o sistema',
      content: 'Verifique:\n• Se você está online\n• Se a URL está correta\n• Se não há problemas de cache\n• Tente em outro navegador\n• Verifique se o sistema não está em manutenção\n\nEntre em contato com o administrador se necessário.',
      category: 'problemas',
      type: 'faq',
      tags: ['acesso', 'login', 'erro', 'navegador'],
      priority: 'high',
      icon: '🚫'
    },
    {
      id: 'faq-email',
      title: 'Não recebi o email de recuperação de senha',
      content: '• Verifique sua caixa de spam/lixo eletrônico\n• Aguarde alguns minutos (pode demorar até 5 minutos)\n• Tente novamente após alguns minutos\n• Entre em contato com o administrador do sistema\n\nO sistema usa Resend API para envio de emails.',
      category: 'problemas',
      type: 'faq',
      tags: ['email', 'recuperação', 'spam', 'demora'],
      priority: 'high',
      icon: '📧'
    },

    // FAQ - Permissões
    {
      id: 'faq-permissoes',
      title: 'Qual a diferença entre usuário ADMIN e RH?',
      content: 'ADMIN:\n• Acesso total ao sistema\n• Gestão de usuários\n• Configurações do sistema\n• Backup e exportação\n• Exclusão de vagas\n\nRH:\n• Visualização de vagas\n• Criação e edição de vagas (baseado em configuração)\n• Comparativo de clientes\n• Exportação de dados',
      category: 'permissões',
      type: 'faq',
      tags: ['admin', 'rh', 'permissões', 'acesso', 'diferença'],
      priority: 'high',
      icon: '👥'
    },
    {
      id: 'faq-limites',
      title: 'Há limites no sistema?',
      content: 'Limites conhecidos:\n• Comparativo: máximo 3 clientes simultâneos\n• Vagas por página: 10, 25 ou 50\n• Sessão: expira após 24 horas de inatividade\n• Sistema otimizado para até 10.000 vagas\n\nNão há limite específico para criação de vagas.',
      category: 'permissões',
      type: 'faq',
      tags: ['limites', 'restrições', 'máximo', 'sessão'],
      priority: 'medium',
      icon: '📏'
    },

    // FAQ - Funcionalidades
    {
      id: 'faq-exportar',
      title: 'Como exportar dados?',
      content: 'Você pode exportar:\n• Lista de vagas: Clique em "Exportar" na página de oportunidades\n• Backup completo: Configurações > Backup e Exportação (apenas ADMIN)\n• Formatos: Excel (.xlsx), CSV, JSON\n\nADMINs podem fazer backup de todos os dados do sistema.',
      category: 'funcionalidades',
      type: 'faq',
      tags: ['exportar', 'backup', 'excel', 'dados'],
      priority: 'medium',
      icon: '📤'
    },
    {
      id: 'faq-mobile',
      title: 'O sistema funciona em dispositivos móveis?',
      content: 'Sim! O sistema é totalmente responsivo:\n• Smartphones\n• Tablets\n• Desktops\n• Laptops\n\nEm dispositivos móveis, a barra lateral se transforma em menu hambúrguer.',
      category: 'funcionalidades',
      type: 'faq',
      tags: ['mobile', 'responsivo', 'tablet', 'smartphone'],
      priority: 'medium',
      icon: '📱'
    },
    {
      id: 'faq-temas',
      title: 'Como alterar o tema da aplicação?',
      content: 'Opções:\n1. Configurações > Temas e Interface (ADMIN)\n2. Botão de tema na barra lateral\n\nTemas disponíveis:\n• Claro (padrão)\n• Escuro\n• Perfis de cor personalizados',
      category: 'funcionalidades',
      type: 'faq',
      tags: ['tema', 'claro', 'escuro', 'cores'],
      priority: 'low',
      icon: '🎨'
    },

    // FAQ - Relatórios
    {
      id: 'faq-relatorios',
      title: 'Como criar um relatório?',
      content: '1. Durante a comparação de clientes, clique no ícone de alerta (⚠️)\n2. Preencha o formulário com:\n   • Título do problema\n   • Descrição detalhada\n   • Tipo de problema\n   • Prioridade\n3. Clique em "Enviar Reporte"\n\nAcompanhe o status em "Relatórios" no menu.',
      category: 'relatórios',
      type: 'faq',
      tags: ['relatório', 'reporte', 'problema', 'bug'],
      priority: 'medium',
      icon: '📋'
    },

    // Manual - Configurações (ADMIN)
    {
      id: 'admin-backup',
      title: 'Como fazer backup dos dados (ADMIN)',
      content: '1. Acesse "Configurações" > "Backup e Exportação"\n2. Configure quais dados incluir:\n   • Vagas (padrão)\n   • Usuários (opcional)\n   • Logs de backup (opcional)\n   • Notícias (opcional)\n3. Escolha o formato (Excel, CSV, JSON)\n4. Clique em "Criar Backup"\n5. Baixe o arquivo gerado',
      category: 'admin',
      type: 'manual',
      tags: ['backup', 'exportar', 'dados', 'admin', 'configurações'],
      priority: 'high',
      icon: '💾'
    },
    {
      id: 'admin-usuarios',
      title: 'Gerenciar usuários (ADMIN)',
      content: '1. Acesse "Usuários" no menu lateral\n2. Clique em "Adicionar Usuário" para criar novos\n3. Use os ícones de edição para modificar usuários existentes\n4. Configure roles (ADMIN/RH)\n5. Gerencie permissões específicas\n\nApenas ADMINs podem gerenciar usuários.',
      category: 'admin',
      type: 'manual',
      tags: ['usuários', 'gerenciar', 'criar', 'editar', 'roles'],
      priority: 'high',
      icon: '👤'
    },
    {
      id: 'admin-noticias',
      title: 'Criar notícias internas (ADMIN)',
      content: '1. Acesse "Configurações" > "Sistema de Notícias"\n2. Clique em "Criar Notícia"\n3. Preencha:\n   • Título\n   • Conteúdo\n   • Tipo (Info, Warning, Success)\n4. Ative/desative conforme necessário\n5. Salve a notícia\n\nNotícias aparecem no dashboard dos usuários.',
      category: 'admin',
      type: 'manual',
      tags: ['notícias', 'comunicado', 'avisos', 'sistema'],
      priority: 'medium',
      icon: '📢'
    }
  ]

  // Categorias disponíveis
  const categories = [
    { id: 'all', label: 'Todas', icon: '📚' },
    { id: 'autenticacao', label: 'Autenticação', icon: '🔐' },
    { id: 'vagas', label: 'Gestão de Vagas', icon: '💼' },
    { id: 'comparativo', label: 'Comparativo', icon: '📊' },
    { id: 'problemas', label: 'Problemas Técnicos', icon: '🔧' },
    { id: 'permissões', label: 'Permissões', icon: '👥' },
    { id: 'funcionalidades', label: 'Funcionalidades', icon: '⚙️' },
    { id: 'relatórios', label: 'Relatórios', icon: '📋' },
    { id: 'admin', label: 'Configurações (ADMIN)', icon: '🛠️' }
  ]

  // Função de busca inteligente
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm.trim()) {
      return helpContent.map(content => ({ content, relevance: 1, matchedText: [] }))
    }

    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 2)
    
    return helpContent
      .map(content => {
        let relevance = 0
        const matchedText: string[] = []
        
        // Buscar no título (peso alto)
        searchWords.forEach(word => {
          if (content.title.toLowerCase().includes(word)) {
            relevance += 10
            matchedText.push(content.title)
          }
        })
        
        // Buscar no conteúdo (peso médio)
        searchWords.forEach(word => {
          if (content.content.toLowerCase().includes(word)) {
            relevance += 5
            matchedText.push(content.content.substring(0, 100) + '...')
          }
        })
        
        // Buscar nas tags (peso baixo)
        searchWords.forEach(word => {
          if (content.tags.some(tag => tag.toLowerCase().includes(word))) {
            relevance += 2
            matchedText.push(`Tag: ${word}`)
          }
        })
        
        return { content, relevance, matchedText }
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
  }, [searchTerm])

  // Filtrar por categoria e tipo
  const filteredResults = useMemo(() => {
    return searchResults.filter(result => {
      const categoryMatch = selectedCategory === 'all' || result.content.category === selectedCategory
      const typeMatch = selectedType === 'all' || result.content.type === selectedType
      return categoryMatch && typeMatch
    })
  }, [searchResults, selectedCategory, selectedType])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Feedback visual simples sem dependência externa
    alert('Conteúdo copiado para a área de transferência!')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            Tira Dúvidas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Encontre respostas rápidas para suas dúvidas sobre o sistema
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span>{helpContent.length} tópicos disponíveis</span>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Busque por qualquer termo: login, criar vaga, backup, problemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="autenticacao">Autenticação</TabsTrigger>
                  <TabsTrigger value="vagas">Vagas</TabsTrigger>
                  <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
                  <TabsTrigger value="problemas">Problemas</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tipo:</span>
                <div className="flex gap-1">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={selectedType === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('manual')}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={selectedType === 'faq' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('faq')}
                  >
                    FAQ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        {searchTerm && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredResults.length} resultado(s) encontrado(s) para "{searchTerm}"
          </div>
        )}

        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente usar termos diferentes ou verifique os filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredResults.map((result) => (
              <Card key={result.content.id} className="hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleExpanded(result.content.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{result.content.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {result.content.title}
                          {result.content.type === 'faq' && (
                            <Badge variant="secondary" className="text-xs">
                              FAQ
                            </Badge>
                          )}
                          {result.content.type === 'manual' && (
                            <Badge variant="outline" className="text-xs">
                              Manual
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {categories.find(cat => cat.id === result.content.category)?.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(result.content.priority)}>
                        {getPriorityLabel(result.content.priority)}
                      </Badge>
                      <ChevronRight 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedItems.has(result.content.id) ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {expandedItems.has(result.content.id) && (
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {result.content.content}
                        </pre>
                      </div>
                      
                      {result.content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.content.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ExternalLink className="h-3 w-3" />
                          <span>Útil para: {result.content.tags.slice(0, 3).join(', ')}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.content.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dicas Rápidas */}
      {!searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Dicas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Busca Inteligente</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Digite qualquer termo para encontrar respostas rápidas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Copy className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Copiar Respostas</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Use o botão "Copiar" para salvar instruções
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Filter className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Filtros Específicos</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Use os filtros para encontrar tópicos específicos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
