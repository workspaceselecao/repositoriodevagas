// Componente para alternar entre sistema de cache antigo e novo
// Permite migração gradual e teste do novo sistema

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { useIntelligentCache } from '../lib/intelligent-cache'
import { 
  Zap, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Info,
  Settings,
  BarChart3
} from 'lucide-react'

interface CacheMigrationToggleProps {
  onToggle?: (useOptimized: boolean) => void
}

export default function CacheMigrationToggle({ onToggle }: CacheMigrationToggleProps) {
  const [useOptimizedCache, setUseOptimizedCache] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const cache = useIntelligentCache()

  // Carregar preferência salva
  useEffect(() => {
    const saved = localStorage.getItem('use-optimized-cache')
    if (saved !== null) {
      setUseOptimizedCache(JSON.parse(saved))
    }
  }, [])

  // Atualizar estatísticas do cache
  useEffect(() => {
    const updateStats = () => {
      try {
        const stats = cache.getStats()
        const debugInfo = cache.getDebugInfo()
        setCacheStats({ stats, debugInfo })
      } catch (error) {
        console.warn('Erro ao obter estatísticas do cache:', error)
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 5000) // Atualizar a cada 5 segundos
    
    return () => clearInterval(interval)
  }, [cache])

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true)
    
    try {
      setUseOptimizedCache(enabled)
      localStorage.setItem('use-optimized-cache', JSON.stringify(enabled))
      
      if (enabled) {
        // Configurar cache otimizado
        cache.updateConfig({
          enablePersistentCache: true,
          enableReactiveCache: true,
          enableIntelligentRefresh: true,
          enableBackgroundSync: true,
          enableOptimisticUpdates: true,
          defaultTTL: 10 * 60 * 1000, // 10 minutos
          maxCacheSize: 1000
        })
        console.log('✅ Cache otimizado ativado')
      } else {
        // Limpar cache otimizado
        cache.clear()
        console.log('🗑️ Cache otimizado desativado')
      }
      
      onToggle?.(enabled)
      
    } catch (error) {
      console.error('Erro ao alternar cache:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshStats = () => {
    try {
      const stats = cache.getStats()
      const debugInfo = cache.getDebugInfo()
      setCacheStats({ stats, debugInfo })
    } catch (error) {
      console.warn('Erro ao atualizar estatísticas:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Sistema de Cache
          <Badge variant={useOptimizedCache ? "default" : "secondary"}>
            {useOptimizedCache ? "Otimizado" : "Legado"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Sistema de cache inteligente e persistente para melhorar a experiência do usuário
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Toggle Principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 ${useOptimizedCache ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">Cache Otimizado</p>
              <p className="text-sm text-muted-foreground">
                Sistema inteligente com persistência e sincronização automática
              </p>
            </div>
          </div>
          
          <Switch
            checked={useOptimizedCache}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {/* Estatísticas do Cache */}
        {cacheStats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Hit Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {cacheStats.stats.hitRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Itens em Cache</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {cacheStats.stats.size}
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Hits</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {cacheStats.stats.hits}
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Misses</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {cacheStats.stats.misses}
              </p>
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4" />
            <span className="font-medium">Informações do Sistema</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Cache Persistente:</span>
              <Badge variant={useOptimizedCache ? "default" : "secondary"}>
                {useOptimizedCache ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>Sincronização em Background:</span>
              <Badge variant={useOptimizedCache ? "default" : "secondary"}>
                {useOptimizedCache ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>Atualizações Otimistas:</span>
              <Badge variant={useOptimizedCache ? "default" : "secondary"}>
                {useOptimizedCache ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>Última Limpeza:</span>
              <span className="text-muted-foreground">
                {cacheStats ? new Date(cacheStats.stats.lastCleanup).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStats}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Stats
          </Button>
          
          {useOptimizedCache && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cache.clear()
                handleRefreshStats()
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Limpar Cache
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
