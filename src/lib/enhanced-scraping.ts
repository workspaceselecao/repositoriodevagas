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
  confidence: number
  extractedFields: FieldConfidence
  source: 'html' | 'json' | 'mixed'
  url?: string
}

export interface FieldConfidence {
  titulo: FieldStatus
  descricao_vaga: FieldStatus
  responsabilidades_atribuicoes: FieldStatus
  requisitos_qualificacoes: FieldStatus
  salario: FieldStatus
  horario_trabalho: FieldStatus
  jornada_trabalho: FieldStatus
  beneficios: FieldStatus
  local_trabalho: FieldStatus
  etapas_processo: FieldStatus
}

export interface FieldStatus {
  found: boolean
  confidence: number
  source: 'xpath' | 'json' | 'fallback'
  rawValue: string
  cleanedValue: string
}

export interface ScrapingError {
  message: string
  field?: string
  code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'CORS_ERROR' | 'UNKNOWN_ERROR'
}

export class EnhancedJobScrapingService {
  private static readonly XPATH_PATTERNS = {
    titulo: [
      '//h1[@id="h1"]',
      '//h1[contains(@class, "gdqSpl")]',
      '//meta[@property="og:title"]/@content',
      '//title',
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
   * Método principal para extrair dados de uma URL
   */
  static async extractFromURL(url: string): Promise<ScrapingResult | ScrapingError> {
    try {
      // Validação da URL
      if (!this.isValidGupyURL(url)) {
        return {
          message: 'URL deve ser do domínio atento.gupy.io ou gupy.io',
          code: 'VALIDATION_ERROR'
        }
      }

      // Fetch da página
      const htmlContent = await this.fetchPage(url)
      if (typeof htmlContent === 'object' && 'message' in htmlContent) {
        return htmlContent as ScrapingError
      }

      // Extração híbrida (HTML + JSON)
      const htmlResult = this.extractFromHTML(htmlContent as string)
      const jsonResult = this.extractFromJSON(htmlContent as string)

      // Combinar resultados
      const combinedResult = this.combineResults(htmlResult, jsonResult, url)
      
      return combinedResult
    } catch (error) {
      return {
        message: `Erro ao processar URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        code: 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * Extrai dados de HTML usando XPath
   */
  static extractFromHTML(htmlContent: string): Partial<ScrapingResult> | ScrapingError {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      const extractedFields: Partial<FieldConfidence> = {}
      const result: Partial<ScrapingResult> = {}

      // Extrair cada campo com análise de confiança
      const fields: (keyof FieldConfidence)[] = [
        'titulo', 'descricao_vaga', 'responsabilidades_atribuicoes', 'requisitos_qualificacoes',
        'salario', 'horario_trabalho', 'jornada_trabalho', 'beneficios', 'local_trabalho', 'etapas_processo'
      ]

      let totalConfidence = 0
      let fieldsFound = 0

      fields.forEach(field => {
        const fieldResult = this.extractFieldWithConfidence(doc, field)
        extractedFields[field] = fieldResult
        result[field] = fieldResult.cleanedValue
        totalConfidence += fieldResult.confidence
        if (fieldResult.found) fieldsFound++
      })

      result.extractedFields = extractedFields as FieldConfidence
      result.confidence = Math.round(totalConfidence / fields.length)
      result.source = 'html'

      return result as ScrapingResult
    } catch (error) {
      return {
        message: `Erro ao processar HTML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        code: 'PARSE_ERROR'
      }
    }
  }

  /**
   * Extrai dados do JSON embebido
   */
  static extractFromJSON(htmlContent: string): Partial<ScrapingResult> | null {
    try {
      const jsonMatch = htmlContent.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)
      if (!jsonMatch) return null

      const jsonData = JSON.parse(jsonMatch[1])
      const jobData = jsonData?.props?.pageProps?.job
      if (!jobData) return null

      const extractedFields: Partial<FieldConfidence> = {}
      const result: Partial<ScrapingResult> = {}

      // Extrair campos do JSON
      const tituloField = this.processJSONField(jobData.name, 'titulo')
      const descricaoField = this.processJSONField(this.cleanHTML(jobData.description || ''), 'descricao_vaga')
      const responsabilidadesField = this.processJSONField(this.cleanHTML(jobData.responsibilities || ''), 'responsabilidades_atribuicoes')
      const requisitosField = this.processJSONField(this.cleanHTML(jobData.prerequisites || ''), 'requisitos_qualificacoes')
      
      // Extrair informações adicionais do campo relevantExperiences
      const additionalInfo = jobData.relevantExperiences || ''
      const salarioField = this.processJSONField(this.extractSalaryFromText(additionalInfo), 'salario')
      const horarioField = this.processJSONField(this.extractHorarioFromText(additionalInfo), 'horario_trabalho')
      const jornadaField = this.processJSONField(this.extractJornadaFromText(additionalInfo), 'jornada_trabalho')
      const beneficiosField = this.processJSONField(this.extractBeneficiosFromText(additionalInfo), 'beneficios')
      
      const localField = this.processJSONField(jobData.addressLine || '', 'local_trabalho')
      const etapasField = this.processJSONField(this.formatEtapasProcesso(jobData.jobSteps || []), 'etapas_processo')

      // Construir resultado
      extractedFields.titulo = tituloField
      extractedFields.descricao_vaga = descricaoField
      extractedFields.responsabilidades_atribuicoes = responsabilidadesField
      extractedFields.requisitos_qualificacoes = requisitosField
      extractedFields.salario = salarioField
      extractedFields.horario_trabalho = horarioField
      extractedFields.jornada_trabalho = jornadaField
      extractedFields.beneficios = beneficiosField
      extractedFields.local_trabalho = localField
      extractedFields.etapas_processo = etapasField

      result.titulo = tituloField.cleanedValue
      result.descricao_vaga = descricaoField.cleanedValue
      result.responsabilidades_atribuicoes = responsabilidadesField.cleanedValue
      result.requisitos_qualificacoes = requisitosField.cleanedValue
      result.salario = salarioField.cleanedValue
      result.horario_trabalho = horarioField.cleanedValue
      result.jornada_trabalho = jornadaField.cleanedValue
      result.beneficios = beneficiosField.cleanedValue
      result.local_trabalho = localField.cleanedValue
      result.etapas_processo = etapasField.cleanedValue

      const totalConfidence = Object.values(extractedFields).reduce((sum, field) => sum + field.confidence, 0)
      result.confidence = Math.round(totalConfidence / Object.keys(extractedFields).length)
      result.extractedFields = extractedFields as FieldConfidence
      result.source = 'json'

      return result as ScrapingResult
    } catch (error) {
      console.warn('Erro ao extrair dados do JSON:', error)
      return null
    }
  }

  /**
   * Extrai campo específico com análise de confiança
   */
  private static extractFieldWithConfidence(doc: Document, field: keyof FieldConfidence): FieldStatus {
    const xpaths = this.XPATH_PATTERNS[field]
    
    for (let i = 0; i < xpaths.length; i++) {
      try {
        const element = this.evaluateXPath(doc, xpaths[i])
        if (element) {
          const rawValue = element.textContent || element.innerText || ''
          const cleanedValue = this.cleanText(rawValue)
          
          if (cleanedValue.trim()) {
            const baseConfidence = Math.max(0, 100 - (i * 15)) // Primeiros XPaths têm maior confiança
            const contentConfidence = this.calculateContentConfidence(cleanedValue, field)
            const confidence = Math.min(100, baseConfidence + contentConfidence)
            
            return {
              found: true,
              confidence,
              source: 'xpath',
              rawValue,
              cleanedValue
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao extrair ${field} com XPath: ${xpaths[i]}`, error)
      }
    }

    return {
      found: false,
      confidence: 0,
      source: 'xpath',
      rawValue: '',
      cleanedValue: ''
    }
  }

  /**
   * Processa campo do JSON com análise de confiança
   */
  private static processJSONField(value: string, field: keyof FieldConfidence): FieldStatus {
    const cleanedValue = this.cleanText(value)
    const confidence = this.calculateContentConfidence(cleanedValue, field)
    
    return {
      found: !!cleanedValue.trim(),
      confidence: Math.min(100, confidence + 20), // JSON tem confiança base maior
      source: 'json',
      rawValue: value,
      cleanedValue
    }
  }

  /**
   * Combina resultados de HTML e JSON
   */
  private static combineResults(
    htmlResult: Partial<ScrapingResult> | ScrapingError,
    jsonResult: Partial<ScrapingResult> | null,
    url: string
  ): ScrapingResult {
    const result: Partial<ScrapingResult> = {
      titulo: '',
      descricao_vaga: '',
      responsabilidades_atribuicoes: '',
      requisitos_qualificacoes: '',
      salario: '',
      horario_trabalho: '',
      jornada_trabalho: '',
      beneficios: '',
      local_trabalho: '',
      etapas_processo: '',
      confidence: 0,
      extractedFields: {} as FieldConfidence,
      source: 'mixed',
      url
    }

    const combinedFields: Partial<FieldConfidence> = {}

    // Campos para combinar
    const fields: (keyof FieldConfidence)[] = [
      'titulo', 'descricao_vaga', 'responsabilidades_atribuicoes', 'requisitos_qualificacoes',
      'salario', 'horario_trabalho', 'jornada_trabalho', 'beneficios', 'local_trabalho', 'etapas_processo'
    ]

    let totalConfidence = 0

    fields.forEach(field => {
      const htmlField = 'extractedFields' in htmlResult ? htmlResult.extractedFields?.[field] : null
      const jsonField = jsonResult?.extractedFields?.[field]

      // Escolher o melhor campo baseado na confiança
      let bestField: FieldStatus
      if (jsonField && htmlField) {
        // Usar o campo com maior confiança
        bestField = jsonField.confidence >= htmlField.confidence ? jsonField : htmlField
        result.source = 'mixed'
      } else if (jsonField) {
        bestField = jsonField
      } else if (htmlField) {
        bestField = htmlField
      } else {
        bestField = {
          found: false,
          confidence: 0,
          source: 'fallback',
          rawValue: '',
          cleanedValue: ''
        }
      }

      combinedFields[field] = bestField
      result[field] = bestField.cleanedValue
      totalConfidence += bestField.confidence
    })

    result.extractedFields = combinedFields as FieldConfidence
    result.confidence = Math.round(totalConfidence / fields.length)

    return result as ScrapingResult
  }

  /**
   * Calcula confiança baseada na qualidade do conteúdo
   */
  private static calculateContentConfidence(text: string, field: keyof FieldConfidence): number {
    if (!text.trim()) return 0

    let confidence = 0

    // Verificações específicas por campo
    switch (field) {
      case 'titulo':
        if (text.length > 10 && text.length < 200) confidence += 30
        if (text.includes('-') || text.includes('(')) confidence += 20
        if (text.match(/[A-Z][a-z]+.*[A-Z][a-z]+/)) confidence += 15 // Múltiplas palavras capitalizadas
        break

      case 'salario':
        if (text.includes('R$')) confidence += 40
        if (text.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/)) confidence += 30
        if (text.includes('variável') || text.includes('meta')) confidence += 10
        break

      case 'horario_trabalho':
        if (text.match(/\d{1,2}:\d{2}/)) confidence += 35
        if (text.includes('às') || text.includes('h')) confidence += 25
        if (text.includes('saídas') || text.includes('entrada')) confidence += 15
        break

      case 'jornada_trabalho':
        if (text.includes('h/mês') || text.includes('h/ mês')) confidence += 35
        if (text.match(/\d+x\d+/)) confidence += 25
        if (text.includes('escala') || text.includes('folga')) confidence += 15
        break

      case 'local_trabalho':
        if (text.includes('Praça') || text.includes('Avenida') || text.includes('Rua')) confidence += 30
        if (text.includes('-') && text.includes(',')) confidence += 25
        if (text.match(/\d{5}-\d{3}/)) confidence += 20 // CEP
        break

      case 'etapas_processo':
        if (text.includes('Etapa')) confidence += 35
        if (text.split('\n').length > 3) confidence += 25
        if (text.includes('Cadastro') || text.includes('Entrevista')) confidence += 15
        break

      default:
        if (text.length > 100) confidence += 20
        if (text.includes('\n') || text.includes('•') || text.includes('-')) confidence += 15
        if (text.split(' ').length > 20) confidence += 10
    }

    // Verificações gerais
    if (text.length > 200) confidence += 10
    if (text.split(' ').length > 15) confidence += 10
    if (text.includes('Atento') || text.includes('Gupy')) confidence += 5

    return Math.min(70, confidence) // Máximo de 70 pontos extras
  }

  /**
   * Fetch da página com headers robustos
   */
  private static async fetchPage(url: string): Promise<string | ScrapingError> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }
      })

      if (!response.ok) {
        return {
          message: `Erro HTTP: ${response.status} ${response.statusText}`,
          code: 'NETWORK_ERROR'
        }
      }

      return await response.text()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          message: 'Erro de CORS: Não foi possível acessar a URL. Tente fazer upload do arquivo HTML.',
          code: 'CORS_ERROR'
        }
      }
      return {
        message: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        code: 'NETWORK_ERROR'
      }
    }
  }

  /**
   * Valida URL do Gupy
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
   * Avalia XPath no documento
   */
  private static evaluateXPath(doc: Document, xpath: string): Element | null {
    try {
      const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      return result.singleNodeValue as Element
    } catch (error) {
      return null
    }
  }

  /**
   * Limpa texto extraído
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .replace(/^\s*Salário:\s*/, '')
      .replace(/^\s*Local de trabalho:\s*/, '')
      .replace(/^\s*Horário de Trabalho:\s*/, '')
      .replace(/^\s*Jornada de Trabalho:\s*/, '')
  }

  /**
   * Limpa HTML
   */
  private static cleanHTML(htmlText: string): string {
    return htmlText
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Métodos auxiliares para extração de campos específicos
  private static extractSalaryFromText(text: string): string {
    const salarioMatch = text.match(/Salário[:\s]*([^<]*?)(?=<|$)/i)
    return salarioMatch ? salarioMatch[1].trim() : ''
  }

  private static extractHorarioFromText(text: string): string {
    const horarioMatch = text.match(/Horário de Trabalho[^<]*?([0-9]{1,2}[hH][0-9]{2}[^<]*?)(?=<|$)/i)
    return horarioMatch ? horarioMatch[1].trim() : ''
  }

  private static extractJornadaFromText(text: string): string {
    const jornadaMatch = text.match(/Jornada de Trabalho[^<]*?([0-9]+h\/mês[^<]*?)(?=<|$)/i)
    return jornadaMatch ? jornadaMatch[1].trim() : ''
  }

  private static extractBeneficiosFromText(text: string): string {
    const beneficiosMatch = text.match(/Benefícios[^<]*?(.*?)(?=Local de trabalho|$)/is)
    return beneficiosMatch ? this.cleanHTML(beneficiosMatch[1]).trim() : ''
  }

  private static formatEtapasProcesso(etapas: any[]): string {
    if (!Array.isArray(etapas)) return ''
    
    return etapas
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((etapa, index) => `Etapa ${index + 1}: ${etapa.name || ''}`)
      .join('\n')
  }

  /**
   * Converte resultado para VagaFormData
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
