// Script para limpar cache do localStorage
// Execute este script no console do navegador para limpar o cache corrompido

console.log('🧹 Limpando cache do localStorage...')

// Lista de chaves de cache a serem removidas
const cacheKeys = [
  'repositoriodevagas_cache',
  'repositoriodevagas_cache_user_63b5dd5b-c5d1-4b28-921a-1936447da1c1'
]

// Remover chaves específicas
cacheKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
    console.log(`✅ Removido: ${key}`)
  }
})

// Remover todas as chaves que começam com o padrão do cache
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('repositoriodevagas_cache')) {
    localStorage.removeItem(key)
    console.log(`✅ Removido: ${key}`)
  }
})

// Limpar também sessionStorage se necessário
Object.keys(sessionStorage).forEach(key => {
  if (key.startsWith('repositoriodevagas_cache')) {
    sessionStorage.removeItem(key)
    console.log(`✅ Removido do sessionStorage: ${key}`)
  }
})

console.log('🎉 Cache limpo com sucesso! Recarregue a página.')
