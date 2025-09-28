const CACHE_NAME = 'repo-vagas-v1'
const STATIC_CACHE_NAME = 'repo-vagas-static-v1'
const DYNAMIC_CACHE_NAME = 'repo-vagas-dynamic-v1'

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.svg'
]

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos estáticos')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('[SW] Service worker instalado com sucesso')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Erro ao instalar service worker:', error)
      })
  )
})

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker ativado')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar requisições para APIs externas (Supabase)
  if (url.hostname.includes('supabase.co')) {
    return
  }

  // Estratégia para diferentes tipos de recursos
  if (request.destination === 'document') {
    // Para páginas HTML: Network First com fallback para cache
    event.respondWith(networkFirstStrategy(request))
  } else if (request.destination === 'image' || 
             request.url.includes('.png') || 
             request.url.includes('.jpg') || 
             request.url.includes('.svg') ||
             request.url.includes('.ico')) {
    // Para imagens: Cache First
    event.respondWith(cacheFirstStrategy(request))
  } else if (request.url.includes('.js') || 
             request.url.includes('.css') ||
             request.url.includes('.woff2')) {
    // Para assets estáticos: Cache First
    event.respondWith(cacheFirstStrategy(request))
  } else {
    // Para outros recursos: Network First
    event.respondWith(networkFirstStrategy(request))
  }
})

// Estratégia Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Rede indisponível, buscando no cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Se for uma página HTML e não estiver no cache, retornar a página inicial
    if (request.destination === 'document') {
      const fallbackResponse = await caches.match('/')
      if (fallbackResponse) {
        return fallbackResponse
      }
    }
    
    throw error
  }
}

// Estratégia Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('[SW] Erro ao buscar recurso:', request.url, error)
    throw error
  }
}

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Notificar clientes sobre atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
