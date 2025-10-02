// Utilitário para compressão e descompressão de dados do cache
// Usa técnicas simples de compressão para reduzir o tamanho dos dados no localStorage

interface CompressionStats {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  compressionTime: number
}

// Função para comprimir dados usando técnicas simples
export function compressCacheData(data: any): { compressed: string, stats: CompressionStats } {
  const startTime = performance.now()
  
  try {
    // Converter para JSON string
    const jsonString = JSON.stringify(data)
    const originalSize = new Blob([jsonString]).size
    
    // Técnicas de compressão simples:
    // 1. Remover espaços desnecessários
    let compressed = jsonString
      .replace(/\s+/g, ' ') // Múltiplos espaços para um
      .replace(/:\s+/g, ':') // Remover espaços após ':'
      .replace(/,\s+/g, ',') // Remover espaços após ','
      .replace(/\s+}/g, '}') // Remover espaços antes de '}'
      .replace(/\s+]/g, ']') // Remover espaços antes de ']'
    
    // 2. Substituir strings comuns por tokens menores
    const commonStrings = {
      'created_at': 'ca',
      'updated_at': 'ua',
      'created_by': 'cb',
      'updated_by': 'ub',
      'descricao_vaga': 'dv',
      'responsabilidades_atribuicoes': 'ra',
      'requisitos_qualificacoes': 'rq',
      'horario_trabalho': 'ht',
      'jornada_trabalho': 'jt',
      'local_trabalho': 'lt',
      'etapas_processo': 'ep'
    }
    
    // Aplicar substituições
    Object.entries(commonStrings).forEach(([original, replacement]) => {
      compressed = compressed.replace(new RegExp(`"${original}"`, 'g'), `"${replacement}"`)
    })
    
    const compressedSize = new Blob([compressed]).size
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100
    const compressionTime = performance.now() - startTime
    
    return {
      compressed,
      stats: {
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime
      }
    }
  } catch (error) {
    console.error('Erro ao comprimir dados:', error)
    return {
      compressed: JSON.stringify(data),
      stats: {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        compressionTime: performance.now() - startTime
      }
    }
  }
}

// Função para descomprimir dados
export function decompressCacheData(compressedData: string): { data: any, stats: CompressionStats } {
  const startTime = performance.now()
  
  try {
    // Reverter substituições de strings comuns
    const commonStrings = {
      'ca': 'created_at',
      'ua': 'updated_at',
      'cb': 'created_by',
      'ub': 'updated_by',
      'dv': 'descricao_vaga',
      'ra': 'responsabilidades_atribuicoes',
      'rq': 'requisitos_qualificacoes',
      'ht': 'horario_trabalho',
      'jt': 'jornada_trabalho',
      'lt': 'local_trabalho',
      'ep': 'etapas_processo'
    }
    
    let decompressed = compressedData
    Object.entries(commonStrings).forEach(([token, original]) => {
      decompressed = decompressed.replace(new RegExp(`"${token}"`, 'g'), `"${original}"`)
    })
    
    const data = JSON.parse(decompressed)
    const decompressionTime = performance.now() - startTime
    
    return {
      data,
      stats: {
        originalSize: new Blob([compressedData]).size,
        compressedSize: new Blob([decompressed]).size,
        compressionRatio: 0, // Não aplicável na descompressão
        compressionTime: decompressionTime
      }
    }
  } catch (error) {
    console.error('Erro ao descomprimir dados:', error)
    return {
      data: null,
      stats: {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        compressionTime: performance.now() - startTime
      }
    }
  }
}

// Função para verificar se os dados devem ser comprimidos (threshold otimizado)
export function shouldCompress(data: any, threshold: number = 100000): boolean {
  try {
    const jsonString = JSON.stringify(data)
    const size = new Blob([jsonString]).size
    return size > threshold // Comprimir apenas se maior que 100KB (aumentado de 50KB)
  } catch (error) {
    return false
  }
}

// Função para obter estatísticas de tamanho dos dados
export function getDataSize(data: any): { size: number, sizeFormatted: string } {
  try {
    const jsonString = JSON.stringify(data)
    const size = new Blob([jsonString]).size
    
    const formatSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    return {
      size,
      sizeFormatted: formatSize(size)
    }
  } catch (error) {
    return { size: 0, sizeFormatted: '0 Bytes' }
  }
}
