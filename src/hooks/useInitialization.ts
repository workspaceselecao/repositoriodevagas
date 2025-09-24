import { useState, useEffect, useRef } from 'react'

interface UseInitializationOptions {
  maxRetries?: number
  retryDelay?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useInitialization(
  initializer: () => Promise<void>,
  options: UseInitializationOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    const initialize = async () => {
      if (!isMountedRef.current) return

      try {
        setIsLoading(true)
        setError(null)
        
        await initializer()
        
        if (isMountedRef.current) {
          setIsInitialized(true)
          setIsLoading(false)
          onSuccess?.()
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro de inicialização')
        
        if (isMountedRef.current) {
          setError(error)
          onError?.(error)
          
          // Retry logic
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++
            console.log(`Tentativa ${retryCountRef.current} de inicialização...`)
            
            setTimeout(() => {
              if (isMountedRef.current) {
                initialize()
              }
            }, retryDelay * retryCountRef.current)
          } else {
            setIsLoading(false)
            console.error('Falha na inicialização após todas as tentativas')
          }
        }
      }
    }

    initialize()

    return () => {
      isMountedRef.current = false
    }
  }, [initializer, maxRetries, retryDelay, onSuccess, onError])

  const retry = () => {
    if (!isMountedRef.current) return
    
    retryCountRef.current = 0
    setError(null)
    setIsInitialized(false)
    setIsLoading(true)
  }

  return {
    isInitialized,
    isLoading,
    error,
    retry
  }
}
