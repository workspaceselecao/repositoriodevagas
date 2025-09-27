import { useState, useEffect } from 'react'

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Verificar se há uma atualização disponível
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })

      // Escutar mudanças no controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true)
      })
    }
  }, [])

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Enviar mensagem para o service worker para pular a espera
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  return { updateAvailable, updateServiceWorker }
}
