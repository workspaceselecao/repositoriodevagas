import { VagaFormData } from '../types/database'

export interface ScrapingResult {
  titulo: string
  descricao_vaga: string
  responsabilidades_atribuicoes: string
  requisitos_qualificacoes: string
  salario: string
  horario_trabalho: string
  jornada_trabalho: string
  beneficios: string
  local_trabalho: string
  etapas_processo: string
  confidence: number // Percentual de assertividade (0-100)
  extractedFields: {
    titulo: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    descricao_vaga: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    responsabilidades_atribuicoes: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    requisitos_qualificacoes: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    salario: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    horario_trabalho: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    jornada_trabalho: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    beneficios: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    local_trabalho: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
    etapas_processo: { found: boolean; confidence: number; source: string; rawValue: string; cleanedValue: string }
  }
  source: 'html' | 'json' | 'combined' | 'manual'
}

export interface ScrapingError {
  message: string
  field?: string
}

export class JobScrapingService {
  private static readonly XPATH_PATTERNS = {
    titulo: [
      '//h1[@id="h1" and @class="sc-ccd5d36-6 gdqSpl"]',
      '//meta[@property="og:title"]/@content',
      '//title',
      '//h1[@id="h1"]',
      '//h1[contains(@class, "gdqSpl")]'
    ],
    descricao_vaga: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Descrição da vaga-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[@data-testid="section-Descrição da vaga-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@class="sc-add46fb1-3 cOkxvQ" and preceding-sibling::h2[@data-testid="section-Descrição da vaga-title"]]',
      '//h2[contains(text(), "Descrição da vaga")]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]'
    ],
    responsabilidades_atribuicoes: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Responsabilidades e atribuições-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[@data-testid="section-Responsabilidades e atribuições-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@class="sc-add46fb1-3 cOkxvQ" and preceding-sibling::h2[@data-testid="section-Responsabilidades e atribuições-title"]]',
      '//h2[contains(text(), "Responsabilidades e atribuições")]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]'
    ],
    requisitos_qualificacoes: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Requisitos e qualificações-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[@data-testid="section-Requisitos e qualificações-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@class="sc-add46fb1-3 cOkxvQ" and preceding-sibling::h2[@data-testid="section-Requisitos e qualificações-title"]]',
      '//h2[contains(text(), "Requisitos e qualificações")]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]'
    ],
    salario: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Salário")]',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Salário")]',
      '//p[contains(strong, "Salário")]',
      '//strong[contains(text(), "Salário")]/parent::p',
      '//*[contains(text(), "R$") and contains(text(), ",")]'
    ],
    horario_trabalho: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//strong[contains(text(), "Horário de Trabalho")]/following-sibling::ul/li',
      '//li[contains(text(), "Das ") and contains(text(), " às ")]',
      '//*[contains(text(), "Das ") and contains(text(), " às ")]',
      '//*[contains(text(), "08:00") and contains(text(), "17:48")]',
      '//*[matches(text(), "\\d{1,2}:\\d{2}") and contains(text(), "às")]'
    ],
    jornada_trabalho: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Jornada de Trabalho")]/following-sibling::p',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Jornada de Trabalho")]/following-sibling::p',
      '//p[contains(strong, "Jornada de Trabalho")]/following-sibling::p',
      '//strong[contains(text(), "Jornada de Trabalho")]/following-sibling::text()',
      '//*[contains(text(), "h/mês") or contains(text(), "x2") or contains(text(), "x1")]'
    ],
    beneficios: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Benefícios")]/following-sibling::ul',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Benefícios")]/following-sibling::ul',
      '//p[contains(strong, "Benefícios")]/following-sibling::ul',
      '//strong[contains(text(), "Benefícios")]/following-sibling::ul',
      '//ul[.//li[contains(text(), "Vale Transporte") or contains(text(), "Vale refeição")]]'
    ],
    local_trabalho: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Local de trabalho")]',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Local de trabalho")]',
      '//p[contains(strong, "Local de trabalho")]',
      '//strong[contains(text(), "Local de trabalho")]/parent::p',
      '//p[contains(text(), "Local de trabalho:")]',
      '//*[contains(text(), "Av ") and contains(text(), " - ")]',
      '//*[contains(text(), "Rua ") and contains(text(), " - ")]',
      '//*[contains(text(), "Praça ") and contains(text(), " - ")]',
      '//*[contains(text(), "Av ") or contains(text(), "Rua ") or contains(text(), "Praça ")]'
    ],
    etapas_processo: [
      '//ol[@data-testid="job-steps-list" and @class="sc-97f6c339-0 wTJDe"]',
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Etapas do processo-title"]]//ol[@data-testid="job-steps-list"]',
      '//h2[@data-testid="section-Etapas do processo-title"]/following-sibling::ol[@data-testid="job-steps-list"]',
      '//ol[.//li[contains(text(), "Etapa 1:")]]',
      '//ol[@class="sc-97f6c339-0 wTJDe"]'
    ]
  }

  /**
   * Extrai dados de uma página HTML usando XPath
   */
  static extractFromHTML(htmlContent: string): ScrapingResult | ScrapingError {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      const extractedFields: any = {}
      const result: Partial<ScrapingResult> = {}
      
      // Extrair cada campo com confiança usando a nova função com fallback
      const tituloResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.titulo, 'titulo')
      const descricaoResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.descricao_vaga, 'descricao_vaga')
      const responsabilidadesResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.responsabilidades_atribuicoes, 'responsabilidades_atribuicoes')
      const requisitosResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.requisitos_qualificacoes, 'requisitos_qualificacoes')
      const salarioResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.salario, 'salario')
      const horarioResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.horario_trabalho, 'horario_trabalho')
      const jornadaResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.jornada_trabalho, 'jornada_trabalho')
      const beneficiosResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.beneficios, 'beneficios')
      // Formatar benefícios como lista se encontrado
      if (beneficiosResult.text) {
        beneficiosResult.text = this.formatBeneficiosAsList(beneficiosResult.text)
      }
      const localResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.local_trabalho, 'local_trabalho')
      const etapasResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.etapas_processo, 'etapas_processo')
      // Formatar etapas removendo prefixo "Etapa x:" se encontrado
      if (etapasResult.text) {
        etapasResult.text = this.formatEtapasAsList(etapasResult.text)
      }

      // Construir resultado
      result.titulo = tituloResult.text
      result.descricao_vaga = descricaoResult.text
      result.responsabilidades_atribuicoes = responsabilidadesResult.text
      result.requisitos_qualificacoes = requisitosResult.text
      result.salario = salarioResult.text
      result.horario_trabalho = horarioResult.text
      result.jornada_trabalho = jornadaResult.text
      result.beneficios = beneficiosResult.text
      result.local_trabalho = localResult.text
      result.etapas_processo = etapasResult.text

      // Calcular confiança geral
      const totalConfidence = (
        tituloResult.confidence + descricaoResult.confidence + responsabilidadesResult.confidence +
        requisitosResult.confidence + salarioResult.confidence + horarioResult.confidence +
        jornadaResult.confidence + beneficiosResult.confidence + localResult.confidence +
        etapasResult.confidence
      ) / 10

      result.confidence = Math.round(totalConfidence)
      result.source = 'html'

      // Mapear campos extraídos
      result.extractedFields = {
        titulo: { found: !!tituloResult.text, confidence: tituloResult.confidence, source: 'xpath', rawValue: tituloResult.text, cleanedValue: tituloResult.text },
        descricao_vaga: { found: !!descricaoResult.text, confidence: descricaoResult.confidence, source: 'xpath', rawValue: descricaoResult.text, cleanedValue: descricaoResult.text },
        responsabilidades_atribuicoes: { found: !!responsabilidadesResult.text, confidence: responsabilidadesResult.confidence, source: 'xpath', rawValue: responsabilidadesResult.text, cleanedValue: responsabilidadesResult.text },
        requisitos_qualificacoes: { found: !!requisitosResult.text, confidence: requisitosResult.confidence, source: 'xpath', rawValue: requisitosResult.text, cleanedValue: requisitosResult.text },
        salario: { found: !!salarioResult.text, confidence: salarioResult.confidence, source: 'xpath', rawValue: salarioResult.text, cleanedValue: salarioResult.text },
        horario_trabalho: { found: !!horarioResult.text, confidence: horarioResult.confidence, source: 'xpath', rawValue: horarioResult.text, cleanedValue: horarioResult.text },
        jornada_trabalho: { found: !!jornadaResult.text, confidence: jornadaResult.confidence, source: 'xpath', rawValue: jornadaResult.text, cleanedValue: jornadaResult.text },
        beneficios: { found: !!beneficiosResult.text, confidence: beneficiosResult.confidence, source: 'xpath', rawValue: beneficiosResult.text, cleanedValue: beneficiosResult.text },
        local_trabalho: { found: !!localResult.text, confidence: localResult.confidence, source: 'xpath', rawValue: localResult.text, cleanedValue: localResult.text },
        etapas_processo: { found: !!etapasResult.text, confidence: etapasResult.confidence, source: 'xpath', rawValue: etapasResult.text, cleanedValue: etapasResult.text }
      }

      return result as ScrapingResult
    } catch (error) {
      return {
        message: `Erro ao processar HTML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Extrai etapas do processo - função especial para listas (fallback)
   */
  private static extractEtapasProcessoFallback(doc: Document, xpaths: string[]): { text: string; confidence: number } {
    for (let i = 0; i < xpaths.length; i++) {
      try {
        // Primeiro encontrar o container da lista
        const container = this.evaluateXPath(doc, xpaths[i])
        if (container) {
          // Extrair todos os elementos li dentro do container
          const liElements = container.querySelectorAll('li')
          if (liElements.length > 0) {
            const etapas = Array.from(liElements).map(li => {
              return li.textContent || li.innerText || ''
            }).join('\n')
            
            const text = this.cleanText(etapas, 'etapas_processo')
            
            if (text.trim()) {
              const baseConfidence = Math.max(0, 100 - (i * 10))
              const contentConfidence = this.calculateContentConfidence(text, 'etapas_processo')
              const confidence = Math.min(100, baseConfidence + contentConfidence)
              
              return { text, confidence }
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao extrair etapas_processo com XPath: ${xpaths[i]}`, error)
      }
    }

    return { text: '', confidence: 0 }
  }

  /**
   * Função auxiliar para extrair texto com múltiplos padrões de fallback
   */
  private static extractWithFallback(doc: Document, xpaths: string[], field: keyof ScrapingResult): { text: string; confidence: number } {
    // Tratamento especial para etapas_processo - extrair todos os elementos li
    if (field === 'etapas_processo') {
      return this.extractEtapasProcessoFallback(doc, xpaths)
    }
    
    // Tentar XPath primeiro
    for (let i = 0; i < xpaths.length; i++) {
      try {
        const element = this.evaluateXPath(doc, xpaths[i])
        if (element) {
          const text = this.cleanText(element.textContent || (element as HTMLElement).innerText || '', field)
          if (text.trim()) {
            const baseConfidence = Math.max(0, 100 - (i * 10))
            const contentConfidence = this.calculateContentConfidence(text, field)
            const confidence = Math.min(100, baseConfidence + contentConfidence)
            
            return { text, confidence }
          }
        }
      } catch (error) {
        console.warn(`Erro ao extrair ${field} com XPath: ${xpaths[i]}`, error)
      }
    }

    // Fallback: buscar por texto específico no documento inteiro
    const fallbackText = this.extractByTextPattern(doc, field)
    if (fallbackText.text) {
      return fallbackText
    }

    return { text: '', confidence: 0 }
  }

  /**
   * Extrai dados por padrões de texto específicos (fallback)
   */
  private static extractByTextPattern(doc: Document, field: keyof ScrapingResult): { text: string; confidence: number } {
    const allText = doc.body.textContent || ''
    
    switch (field) {
      case 'horario_trabalho':
        const horarioMatch = allText.match(/Horário de Trabalho[^<]*?(Das \d{1,2}:\d{2} às \d{1,2}:\d{2})/i)
        if (horarioMatch) {
          return { text: horarioMatch[1].trim(), confidence: 70 }
        }
        break
        
      case 'local_trabalho':
        const localMatch = allText.match(/Local de trabalho[:\s]*([^<]+?)(?=\s*$|$)/i)
        if (localMatch) {
          return { text: localMatch[1].trim(), confidence: 70 }
        }
        // Fallback adicional para endereços
        const enderecoMatch = allText.match(/(Av|Rua|Praça|Avenida)[^<]+/i)
        if (enderecoMatch) {
          return { text: enderecoMatch[0].trim(), confidence: 60 }
        }
        break
        
      case 'salario':
        const salarioMatch = allText.match(/Salário[:\s]*([^<]*)/i)
        if (salarioMatch && salarioMatch[1].includes('R$')) {
          return { text: salarioMatch[1].trim(), confidence: 70 }
        }
        break
    }
    
    return { text: '', confidence: 0 }
  }

  /**
   * Calcula confiança baseada na qualidade do conteúdo extraído
   */
  private static calculateContentConfidence(text: string, field: keyof ScrapingResult): number {
    if (!text.trim()) return 0

    let confidence = 0

    // Verificações específicas por campo
    switch (field) {
      case 'titulo':
        if (text.length > 10 && text.length < 200) confidence += 20
        if (text.includes('-') || text.includes('(')) confidence += 10 // Títulos de vagas geralmente têm localização
        break

      case 'salario':
        if (text.includes('R$')) confidence += 30
        if (text.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/)) confidence += 20 // Formato de moeda brasileira
        break

      case 'horario_trabalho':
        if (text.match(/\d{1,2}:\d{2}/)) confidence += 25 // Formato de horário
        if (text.includes('às') || text.includes('h')) confidence += 15
        break

      case 'jornada_trabalho':
        if (text.includes('h/mês') || text.includes('h/ mês')) confidence += 25
        if (text.match(/\d+x\d+/)) confidence += 20 // Escala tipo 5x2, 6x1
        break

      case 'local_trabalho':
        if (text.includes('Praça') || text.includes('Avenida') || text.includes('Rua')) confidence += 20
        if (text.includes('-') && text.includes(',')) confidence += 15 // Formato de endereço
        break

      case 'etapas_processo':
        if (text.includes('Etapa')) confidence += 25
        if (text.split('\n').length > 3) confidence += 15 // Múltiplas etapas
        break

      default:
        if (text.length > 50) confidence += 10
        if (text.includes('\n') || text.includes('•') || text.includes('-')) confidence += 10 // Texto estruturado
    }

    // Verificações gerais
    if (text.length > 100) confidence += 5
    if (text.split(' ').length > 10) confidence += 5

    return Math.min(50, confidence) // Máximo de 50 pontos extras
  }

  /**
   * Avalia XPath no documento (fallback para browsers sem suporte nativo)
   */
  private static evaluateXPath(doc: Document, xpath: string): Element | null {
    try {
      // Tentar método nativo primeiro
      const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      return result.singleNodeValue as Element
    } catch (error) {
      // Fallback para seletores CSS simples
      console.warn(`XPath não suportado: ${xpath}, tentando fallback`)
      return null
    }
  }

  /**
   * Limpa e formata o texto extraído
   */
  private static cleanText(text: string, field?: string): string {
    let cleaned = text
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .replace(/^\s*<strong>.*?<\/strong>\s*/, '') // Remove tags strong no início
      .replace(/<[^>]*>/g, '') // Remove outras tags HTML
      .replace(/&nbsp;/g, ' ') // Remove &nbsp;
      .replace(/&amp;/g, '&') // Decodifica &amp;
      .replace(/&lt;/g, '<') // Decodifica &lt;
      .replace(/&gt;/g, '>') // Decodifica &gt;
      .replace(/&quot;/g, '"') // Decodifica &quot;
    
    // Para etapas_processo e beneficios, preservar quebras de linha e processar cada item
    if (field === 'etapas_processo') {
      cleaned = cleaned
        .split('\n')
        .map(line => {
          // Remover prefixo "Etapa X:" se existir
          let withoutPrefix = line.replace(/^Etapa\s+\d+:\s*/i, '').trim()
          
          // Remover números extras que podem aparecer no final (ex: "Cadastro1Cadastro")
          withoutPrefix = withoutPrefix.replace(/\d+$/, '').trim()
          
          // Remover duplicações (ex: "Cadastro1Cadastro" -> "Cadastro")
          const words = withoutPrefix.split(/(?=\d)/)
          if (words.length > 1 && words[1].match(/^\d/)) {
            withoutPrefix = words[0].trim()
          }
          
          return withoutPrefix
        })
        .filter(etapa => etapa.trim() !== '') // Remove etapas vazias
        .join('\n')
    } else if (field === 'beneficios') {
      cleaned = cleaned
        // Processar benefícios - dividir por ponto e vírgula
        .split(/[;]\s*/)
        .map(beneficio => beneficio.trim())
        .filter(beneficio => beneficio.trim() !== '') // Remove benefícios vazios
        .join('\n')
    } else if (field === 'requisitos_qualificacoes') {
      cleaned = cleaned
        // Processar requisitos - dividir por ponto e vírgula
        .split(/[;]\s*/)
        .map(requisito => requisito.trim())
        .filter(requisito => requisito.trim() !== '') // Remove requisitos vazios
        .join('\n')
    } else if (field === 'responsabilidades_atribuicoes') {
      cleaned = cleaned
        // Processar responsabilidades - dividir por ponto e vírgula
        .split(/[;]\s*/)
        .map(responsabilidade => responsabilidade.trim())
        .filter(responsabilidade => responsabilidade.trim() !== '') // Remove responsabilidades vazias
        .join('\n')
    } else if (field === 'descricao_vaga') {
      cleaned = cleaned
        // Preservar quebras de linha naturais - não dividir por ponto e vírgula
        // Apenas normalizar espaços e manter a estrutura original
    } else {
      // Para outros campos, usar limpeza normal
      cleaned = cleaned
        .replace(/\s+/g, ' ')
        .replace(/^\s*Salário:\s*/, '') // Remove prefixo "Salário:"
        .replace(/^\s*Local de trabalho:\s*/, '') // Remove prefixo "Local de trabalho:"
        .replace(/^\s*Horário de Trabalho:\s*/, '') // Remove prefixo "Horário de Trabalho:"
        .replace(/^\s*Jornada de Trabalho:\s*/, '') // Remove prefixo "Jornada de Trabalho:"
        .replace(/^\s*Benefícios:\s*/, '') // Remove prefixo "Benefícios:"
    }
    
    return cleaned
  }

  /**
   * Extrai dados de uma URL (requer proxy CORS ou backend)
   */
  static async extractFromURL(url: string): Promise<ScrapingResult | ScrapingError> {
    try {
      // Validar se é uma URL do Gupy
      if (!this.isValidGupyURL(url)) {
        return {
          message: 'URL deve ser do domínio atento.gupy.io ou gupy.io'
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      })

      if (!response.ok) {
        return {
          message: `Erro HTTP: ${response.status} ${response.statusText}`
        }
      }

      const htmlContent = await response.text()
      const result = this.extractFromHTML(htmlContent)
      
      // Se o resultado for um erro, tentar extrair do JSON embebido
      if ('message' in result) {
        const jsonResult = this.extractFromJSON(htmlContent)
        if (jsonResult) {
          return jsonResult
        }
      }

      return result
    } catch (error) {
      return {
        message: `Erro ao acessar URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Valida se a URL é do domínio Gupy
   */
  private static isValidGupyURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('gupy.io') || urlObj.hostname.includes('atento.gupy.io')
    } catch {
      return false
    }
  }

  /**
   * Extrai dados do JSON embebido na página (fallback)
   */
  private static extractFromJSON(htmlContent: string): ScrapingResult | null {
    try {
      // Procurar pelo script JSON embebido
      const jsonMatch = htmlContent.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)
      if (!jsonMatch) return null

      const jsonData = JSON.parse(jsonMatch[1])
      const jobData = jsonData?.props?.pageProps?.job

      if (!jobData) return null

      return {
        titulo: jobData.name || '',
        descricao_vaga: this.cleanHTML(jobData.description || ''),
        responsabilidades_atribuicoes: this.cleanHTML(jobData.responsibilities || ''),
        requisitos_qualificacoes: this.cleanHTML(jobData.prerequisites || ''),
        salario: this.extractSalaryFromText(jobData.relevantExperiences || ''),
        horario_trabalho: this.extractHorarioFromText(jobData.relevantExperiences || ''),
        jornada_trabalho: this.extractJornadaFromText(jobData.relevantExperiences || ''),
        beneficios: this.extractBeneficiosFromText(jobData.relevantExperiences || ''),
        local_trabalho: jobData.addressLine || this.extractLocalFromText(jobData.relevantExperiences || ''),
        etapas_processo: this.formatEtapasProcesso(jobData.jobSteps || []),
        confidence: 85, // JSON é mais confiável que HTML
        extractedFields: {
          titulo: { found: !!jobData.name, confidence: 90, source: 'json', rawValue: jobData.name || '', cleanedValue: jobData.name || '' },
          descricao_vaga: { found: !!jobData.description, confidence: 85, source: 'json', rawValue: jobData.description || '', cleanedValue: this.cleanHTML(jobData.description || '') },
          responsabilidades_atribuicoes: { found: !!jobData.responsibilities, confidence: 85, source: 'json', rawValue: jobData.responsibilities || '', cleanedValue: this.cleanHTML(jobData.responsibilities || '') },
          requisitos_qualificacoes: { found: !!jobData.prerequisites, confidence: 85, source: 'json', rawValue: jobData.prerequisites || '', cleanedValue: this.cleanHTML(jobData.prerequisites || '') },
          salario: { found: !!(jobData.relevantExperiences && jobData.relevantExperiences.includes('Salário')), confidence: 80, source: 'json', rawValue: jobData.relevantExperiences || '', cleanedValue: this.extractSalaryFromText(jobData.relevantExperiences || '') },
          horario_trabalho: { found: !!(jobData.relevantExperiences && jobData.relevantExperiences.includes('Horário')), confidence: 80, source: 'json', rawValue: jobData.relevantExperiences || '', cleanedValue: this.extractHorarioFromText(jobData.relevantExperiences || '') },
          jornada_trabalho: { found: !!(jobData.relevantExperiences && jobData.relevantExperiences.includes('Jornada')), confidence: 80, source: 'json', rawValue: jobData.relevantExperiences || '', cleanedValue: this.extractJornadaFromText(jobData.relevantExperiences || '') },
          beneficios: { found: !!(jobData.relevantExperiences && jobData.relevantExperiences.includes('Benefícios')), confidence: 80, source: 'json', rawValue: jobData.relevantExperiences || '', cleanedValue: this.extractBeneficiosFromText(jobData.relevantExperiences || '') },
          local_trabalho: { found: !!(jobData.addressLine || (jobData.relevantExperiences && jobData.relevantExperiences.includes('Local de trabalho'))), confidence: 90, source: 'json', rawValue: jobData.addressLine || jobData.relevantExperiences || '', cleanedValue: jobData.addressLine || this.extractLocalFromText(jobData.relevantExperiences || '') },
          etapas_processo: { found: !!(jobData.jobSteps && jobData.jobSteps.length > 0), confidence: 85, source: 'json', rawValue: JSON.stringify(jobData.jobSteps || []), cleanedValue: this.formatEtapasProcesso(jobData.jobSteps || []) }
        },
        source: 'json'
      }
    } catch (error) {
      console.warn('Erro ao extrair dados do JSON:', error)
      return null
    }
  }

  /**
   * Limpa tags HTML do texto
   */
  private static cleanHTML(htmlText: string): string {
    return htmlText
      .replace(/<[^>]*>/g, '') // Remove tags HTML
      .replace(/&nbsp;/g, ' ') // Remove &nbsp;
      .replace(/&amp;/g, '&') // Decodifica &amp;
      .replace(/&lt;/g, '<') // Decodifica &lt;
      .replace(/&gt;/g, '>') // Decodifica &gt;
      .replace(/&quot;/g, '"') // Decodifica &quot;
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim()
  }

  /**
   * Extrai salário do texto
   */
  private static extractSalaryFromText(text: string): string {
    const salarioMatch = text.match(/Salário[:\s]*([^<]*)/i)
    return salarioMatch ? salarioMatch[1].trim() : ''
  }

  /**
   * Extrai horário de trabalho do texto
   */
  private static extractHorarioFromText(text: string): string {
    // Padrão mais específico para capturar "Das 08:00 às 17:48"
    const horarioMatch = text.match(/Horário de Trabalho[^<]*?(Das \d{1,2}:\d{2} às \d{1,2}:\d{2})/i)
    if (horarioMatch) {
      return horarioMatch[1].trim()
    }
    
    // Fallback para outros formatos
    const fallbackMatch = text.match(/Horário de Trabalho[^<]*?([0-9]{1,2}[hH:][0-9]{2}[^<]*)/i)
    return fallbackMatch ? fallbackMatch[1].trim() : ''
  }

  /**
   * Extrai jornada de trabalho do texto
   */
  private static extractJornadaFromText(text: string): string {
    const jornadaMatch = text.match(/Jornada de Trabalho[^<]*?([0-9]+h\/mês[^<]*)/i)
    return jornadaMatch ? jornadaMatch[1].trim() : ''
  }

  /**
   * Extrai benefícios do texto
   */
  private static extractBeneficiosFromText(text: string): string {
    // Padrão mais específico para capturar apenas a lista de benefícios
    const beneficiosMatch = text.match(/Benefícios[^<]*?<ul[^>]*>(.*?)<\/ul>/is)
    if (beneficiosMatch) {
      const beneficiosText = this.cleanHTML(beneficiosMatch[1]).trim()
      return this.formatBeneficiosAsList(beneficiosText)
    }
    
    // Fallback para o padrão anterior
    const fallbackMatch = text.match(/Benefícios[^<]*?(.*?)(?=Local de trabalho|$)/is)
    if (fallbackMatch) {
      const beneficiosText = this.cleanHTML(fallbackMatch[1]).trim()
      return this.formatBeneficiosAsList(beneficiosText)
    }
    return ''
  }

  /**
   * Formata benefícios como lista de tópicos
   */
  private static formatBeneficiosAsList(text: string): string {
    if (!text.trim()) return ''
    
    // Remover tags HTML e normalizar
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
    
    // Dividir por ponto e vírgula ou quebras de linha
    const items = cleanText
      .split(/[;]\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
    
    // Se não encontrou separadores, tentar dividir por quebras de linha
    if (items.length === 1) {
      const lines = cleanText.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0)
      if (lines.length > 1) {
        return lines.join('\n')
      }
    }
    
    // Formatar como lista vertical simples (sem marcadores)
    return items.join('\n')
  }

  /**
   * Extrai local de trabalho do texto
   */
  private static extractLocalFromText(text: string): string {
    // Padrão para capturar "Local de trabalho: Av Barão Homem de Melo, 432 - Estoril Belo Horizonte."
    const localMatch = text.match(/Local de trabalho[:\s]*([^<]+?)(?=\s*$|$)/i)
    if (localMatch) {
      return localMatch[1].trim()
    }
    
    // Fallback para endereços que começam com Av, Rua, etc.
    const enderecoMatch = text.match(/(Av|Rua|Praça|Avenida)[^<]+/i)
    return enderecoMatch ? enderecoMatch[0].trim() : ''
  }

  /**
   * Formata etapas do processo extraídas via HTML
   */
  private static formatEtapasAsList(text: string): string {
    if (!text.trim()) return ''
    
    // Limpar HTML e normalizar
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
    
    // Dividir por quebras de linha
    const lines = cleanText.split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    // Processar cada linha removendo prefixo "Etapa x:" e números extras
    return lines.map(line => {
      // Remover prefixo "Etapa X:" se existir
      let withoutPrefix = line.replace(/^Etapa\s+\d+:\s*/i, '').trim()
      
      // Remover números extras que podem aparecer no final (ex: "Cadastro1Cadastro")
      withoutPrefix = withoutPrefix.replace(/\d+$/, '').trim()
      
      // Remover duplicações (ex: "Cadastro1Cadastro" -> "Cadastro")
      const words = withoutPrefix.split(/(?=\d)/)
      if (words.length > 1 && words[1].match(/^\d/)) {
        withoutPrefix = words[0].trim()
      }
      
      return withoutPrefix
    }).filter(etapa => etapa.trim() !== '').join('\n')
  }

  /**
   * Formata etapas do processo
   */
  private static formatEtapasProcesso(etapas: any[]): string {
    if (!Array.isArray(etapas)) return ''
    
    return etapas
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((etapa) => etapa.name || '')
      .filter(name => name.trim() !== '') // Remove etapas vazias
      .join('\n')
  }

  /**
   * Valida se os dados extraídos são válidos
   */
  static validateScrapingResult(result: ScrapingResult): ScrapingError[] {
    const errors: ScrapingError[] = []

    if (!result.titulo.trim()) {
      errors.push({ message: 'Título não encontrado', field: 'titulo' })
    }

    if (!result.descricao_vaga.trim()) {
      errors.push({ message: 'Descrição da vaga não encontrada', field: 'descricao_vaga' })
    }

    return errors
  }

  /**
   * Converte resultado do scraping para VagaFormData
   */
  static toVagaFormData(result: ScrapingResult, baseData: Partial<VagaFormData> = {}): VagaFormData {
    return {
      site: baseData.site || '',
      categoria: baseData.categoria || '',
      cargo: baseData.cargo || '',
      cliente: baseData.cliente || '',
      celula: baseData.celula || '',
      titulo: result.titulo,
      descricao_vaga: result.descricao_vaga,
      responsabilidades_atribuicoes: result.responsabilidades_atribuicoes,
      requisitos_qualificacoes: result.requisitos_qualificacoes,
      salario: result.salario,
      horario_trabalho: result.horario_trabalho,
      jornada_trabalho: result.jornada_trabalho,
      beneficios: result.beneficios,
      local_trabalho: result.local_trabalho,
      etapas_processo: result.etapas_processo
    }
  }
}

// Fallback para browsers sem suporte a XPath
if (typeof window !== 'undefined' && !window.XPathResult) {
  console.warn('XPath não suportado neste navegador. Algumas funcionalidades podem não funcionar corretamente.')
}
