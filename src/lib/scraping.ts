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
      '//h1[@id="h1"]',
      '//meta[@property="og:title"]/@content',
      '//title',
      '//h1[contains(@class, "gdqSpl")]',
      '//h1[contains(@class, "sc-ccd5d36-6")]'
    ],
    descricao_vaga: [
      '//h2[@data-testid="section-Descrição da vaga-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Descrição da vaga-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[contains(text(), "Descrição da vaga")]/following-sibling::div',
      '//section[.//h2[contains(text(), "Descrição da vaga")]]//div[contains(@class, "cOkxvQ")]'
    ],
    responsabilidades_atribuicoes: [
      '//h2[@data-testid="section-Responsabilidades e atribuições-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Responsabilidades e atribuições-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[contains(text(), "Responsabilidades e atribuições")]/following-sibling::div',
      '//section[.//h2[contains(text(), "Responsabilidades e atribuições")]]//div[contains(@class, "cOkxvQ")]'
    ],
    requisitos_qualificacoes: [
      '//h2[@data-testid="section-Requisitos e qualificações-title"]/following-sibling::div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Requisitos e qualificações-title"]]/div[@class="sc-add46fb1-3 cOkxvQ"]',
      '//h2[contains(text(), "Requisitos e qualificações")]/following-sibling::div',
      '//section[.//h2[contains(text(), "Requisitos e qualificações")]]//div[contains(@class, "cOkxvQ")]'
    ],
    salario: [
      '//p[contains(strong, "Salário")]',
      '//p[contains(text(), "Salário:")]',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Salário")]',
      '//p[contains(text(), "Salário")]',
      '//strong[contains(text(), "Salário")]/parent::p',
      '//*[contains(text(), "R$") and contains(text(), ",")]'
    ],
    horario_trabalho: [
      '//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//p[contains(text(), "Horário de Trabalho")]/following-sibling::ul/li',
      '//strong[contains(text(), "Horário de Trabalho")]/following-sibling::text()',
      '//*[contains(text(), "20h30") or contains(text(), "21H00") or contains(text(), "22H00")]'
    ],
    jornada_trabalho: [
      '//p[contains(strong, "Jornada de Trabalho")]/following-sibling::p',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Jornada de Trabalho")]/following-sibling::p',
      '//p[contains(text(), "Jornada de Trabalho")]/following-sibling::p',
      '//strong[contains(text(), "Jornada de Trabalho")]/following-sibling::text()',
      '//*[contains(text(), "180h") or contains(text(), "220h") or contains(text(), "6x1") or contains(text(), "5x2")]'
    ],
    beneficios: [
      '//p[contains(strong, "Benefícios")]/following-sibling::ul',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Benefícios")]/following-sibling::ul',
      '//p[contains(text(), "Benefícios")]/following-sibling::ul',
      '//strong[contains(text(), "Benefícios")]/following-sibling::ul',
      '//ul[.//li[contains(text(), "Vale Transporte") or contains(text(), "Vale refeição")]]'
    ],
    local_trabalho: [
      '//p[contains(strong, "Local de trabalho")]',
      '//p[contains(text(), "Local de trabalho:")]',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Local de trabalho")]',
      '//p[contains(text(), "Local de Trabalho")]',
      '//strong[contains(text(), "Local de trabalho")]/parent::p',
      '//*[contains(text(), "Praça") or contains(text(), "Avenida") or contains(text(), "Rua")]'
    ],
    etapas_processo: [
      '//ol[@data-testid="job-steps-list"]',
      '//h2[@data-testid="section-Etapas do processo-title"]/following-sibling::ol[@data-testid="job-steps-list"]',
      '//ol[.//li[contains(text(), "Etapa 1:")]]',
      '//h2[contains(text(), "Etapas do processo")]/following-sibling::ol',
      '//section[.//h2[contains(text(), "Etapas do processo")]]//ol'
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
      
      // Função auxiliar para extrair texto usando XPath com pontuação de confiança
      const extractTextWithConfidence = (xpaths: string[], field: keyof ScrapingResult): { text: string; confidence: number } => {
        for (let i = 0; i < xpaths.length; i++) {
          try {
            const element = this.evaluateXPath(doc, xpaths[i])
            if (element) {
              const text = this.cleanText(element.textContent || (element as HTMLElement).innerText || '')
              if (text.trim()) {
                // Calcular confiança baseada na posição do XPath e qualidade do conteúdo
                const baseConfidence = Math.max(0, 100 - (i * 10)) // Primeiros XPaths têm maior confiança
                const contentConfidence = this.calculateContentConfidence(text, field)
                const confidence = Math.min(100, baseConfidence + contentConfidence)
                
                return { text, confidence }
              }
            }
          } catch (error) {
            console.warn(`Erro ao extrair ${field} com XPath: ${xpaths[i]}`, error)
          }
        }
        return { text: '', confidence: 0 }
      }

      // Extrair cada campo com confiança
      const tituloResult = extractTextWithConfidence(this.XPATH_PATTERNS.titulo, 'titulo')
      const descricaoResult = extractTextWithConfidence(this.XPATH_PATTERNS.descricao_vaga, 'descricao_vaga')
      const responsabilidadesResult = extractTextWithConfidence(this.XPATH_PATTERNS.responsabilidades_atribuicoes, 'responsabilidades_atribuicoes')
      const requisitosResult = extractTextWithConfidence(this.XPATH_PATTERNS.requisitos_qualificacoes, 'requisitos_qualificacoes')
      const salarioResult = extractTextWithConfidence(this.XPATH_PATTERNS.salario, 'salario')
      const horarioResult = extractTextWithConfidence(this.XPATH_PATTERNS.horario_trabalho, 'horario_trabalho')
      const jornadaResult = extractTextWithConfidence(this.XPATH_PATTERNS.jornada_trabalho, 'jornada_trabalho')
      const beneficiosResult = extractTextWithConfidence(this.XPATH_PATTERNS.beneficios, 'beneficios')
      const localResult = extractTextWithConfidence(this.XPATH_PATTERNS.local_trabalho, 'local_trabalho')
      const etapasResult = extractTextWithConfidence(this.XPATH_PATTERNS.etapas_processo, 'etapas_processo')

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
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .replace(/^\s*Salário:\s*/, '') // Remove prefixo "Salário:"
      .replace(/^\s*Local de trabalho:\s*/, '') // Remove prefixo "Local de trabalho:"
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
        local_trabalho: jobData.addressLine || '',
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
          local_trabalho: { found: !!jobData.addressLine, confidence: 90, source: 'json', rawValue: jobData.addressLine || '', cleanedValue: jobData.addressLine || '' },
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
    const horarioMatch = text.match(/Horário de Trabalho[^<]*?([0-9]{1,2}[hH][0-9]{2}[^<]*)/i)
    return horarioMatch ? horarioMatch[1].trim() : ''
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
    const beneficiosMatch = text.match(/Benefícios[^<]*?(.*?)(?=Local de trabalho|$)/is)
    return beneficiosMatch ? this.cleanHTML(beneficiosMatch[1]).trim() : ''
  }

  /**
   * Formata etapas do processo
   */
  private static formatEtapasProcesso(etapas: any[]): string {
    if (!Array.isArray(etapas)) return ''
    
    return etapas
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((etapa, index) => `Etapa ${index + 1}: ${etapa.name || ''}`)
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
