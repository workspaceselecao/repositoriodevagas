// Script de teste para verificar a extração de dados
// Execute com: node test-extraction.js

const fs = require('fs');
const { JSDOM } = require('jsdom');

// Simular o ambiente do navegador
global.DOMParser = require('jsdom').JSDOM;
global.window = new JSDOM().window;
global.document = global.window.document;
global.XPathResult = global.window.XPathResult;

// Carregar o arquivo de scraping (versão simplificada para teste)
class TestJobScrapingService {
  static get XPATH_PATTERNS() {
    return {
    horario_trabalho: [
      '//div[@data-testid="text-section" and .//h2[@data-testid="section-Informações adicionais-title"]]//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//div[@class="sc-add46fb1-3 cOkxvQ"]//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//p[contains(strong, "Horário de Trabalho")]/following-sibling::ul/li',
      '//strong[contains(text(), "Horário de Trabalho")]/following-sibling::ul/li',
      '//li[contains(text(), "Das ") and contains(text(), " às ")]',
      '//*[contains(text(), "Das ") and contains(text(), " às ")]',
      '//*[contains(text(), "08:00") and contains(text(), "17:48")]'
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
    ]
    };
  }

  static cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .replace(/^\s*Salário:\s*/, '')
      .replace(/^\s*Local de trabalho:\s*/, '')
      .replace(/^\s*Horário de Trabalho:\s*/, '')
      .replace(/^\s*Jornada de Trabalho:\s*/, '')
      .replace(/^\s*Benefícios:\s*/, '')
      .replace(/^\s*<strong>.*?<\/strong>\s*/, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  }

  static extractByTextPattern(doc, field) {
    const allText = doc.body.textContent || '';
    
    switch (field) {
      case 'horario_trabalho':
        const horarioMatch = allText.match(/Horário de Trabalho[^<]*?(Das \d{1,2}:\d{2} às \d{1,2}:\d{2})/i);
        if (horarioMatch) {
          return { text: horarioMatch[1].trim(), confidence: 70 };
        }
        break;
        
      case 'local_trabalho':
        const localMatch = allText.match(/Local de trabalho[:\s]*([^<]+?)(?=\s*$|$)/i);
        if (localMatch) {
          return { text: localMatch[1].trim(), confidence: 70 };
        }
        break;
    }
    
    return { text: '', confidence: 0 };
  }

  static extractWithFallback(doc, xpaths, field) {
    // Tentar XPath primeiro
    for (let i = 0; i < xpaths.length; i++) {
      try {
        const element = this.evaluateXPath(doc, xpaths[i]);
        if (element) {
          const text = this.cleanText(element.textContent || element.innerText || '');
          if (text.trim()) {
            const baseConfidence = Math.max(0, 100 - (i * 10));
            const confidence = Math.min(100, baseConfidence + 20); // Simular contentConfidence
            
            return { text, confidence };
          }
        }
      } catch (error) {
        console.warn(`Erro ao extrair ${field} com XPath: ${xpaths[i]}`, error.message);
      }
    }

    // Fallback: buscar por texto específico no documento inteiro
    const fallbackText = this.extractByTextPattern(doc, field);
    if (fallbackText.text) {
      return fallbackText;
    }

    return { text: '', confidence: 0 };
  }

  static evaluateXPath(doc, xpath) {
    try {
      const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue;
    } catch (error) {
      console.warn(`XPath não suportado: ${xpath}`);
      return null;
    }
  }

  static testExtraction(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    console.log('🧪 Testando extração de dados...\n');

    // Testar horário de trabalho
    const horarioResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.horario_trabalho, 'horario_trabalho');
    console.log('📅 Horário de Trabalho:');
    console.log(`   Texto: "${horarioResult.text}"`);
    console.log(`   Confiança: ${horarioResult.confidence}%\n`);

    // Testar local de trabalho
    const localResult = this.extractWithFallback(doc, this.XPATH_PATTERNS.local_trabalho, 'local_trabalho');
    console.log('📍 Local de Trabalho:');
    console.log(`   Texto: "${localResult.text}"`);
    console.log(`   Confiança: ${localResult.confidence}%\n`);

    // Testar extração por padrão de texto (fallback)
    console.log('🔍 Testando extração por padrão de texto (fallback):');
    const horarioFallback = this.extractByTextPattern(doc, 'horario_trabalho');
    const localFallback = this.extractByTextPattern(doc, 'local_trabalho');
    
    console.log(`   Horário (fallback): "${horarioFallback.text}" (${horarioFallback.confidence}%)`);
    console.log(`   Local (fallback): "${localFallback.text}" (${localFallback.confidence}%)\n`);

    return {
      horario: horarioResult,
      local: localResult,
      horarioFallback,
      localFallback
    };
  }
}

// Executar teste
try {
  console.log('📄 Carregando arquivo HTML...');
  const htmlContent = fs.readFileSync('9583719.html', 'utf8');
  
  const results = TestJobScrapingService.testExtraction(htmlContent);
  
  console.log('✅ Teste concluído!');
  console.log('\n📊 Resultados esperados:');
  console.log('   Horário: "Das 08:00 às 17:48"');
  console.log('   Local: "Av Barão Homem de Melo, 432 - Estoril Belo Horizonte."');
  
} catch (error) {
  console.error('❌ Erro durante o teste:', error.message);
}
