// Proxy server para contornar CORS no scraping
export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Lidar com preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { url } = req.query

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' })
    return
  }

  try {
    // Validar se é uma URL do Gupy
    if (!url.includes('gupy.io')) {
      res.status(400).json({ error: 'Only Gupy URLs are allowed' })
      return
    }

    // Fazer requisição para a URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      res.status(response.status).json({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      })
      return
    }

    const html = await response.text()
    
    // Retornar o HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)

  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch URL',
      details: error.message 
    })
  }
}
