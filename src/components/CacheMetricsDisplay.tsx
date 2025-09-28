import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { useCacheMetrics } from '../lib/cache-metrics'
import { BarChart3, RefreshCw, Trash2, TrendingUp, Clock, HardDrive, Network } from 'lucide-react'

interface CacheMetricsDisplayProps {
  className?: string
}

export default function CacheMetricsDisplay({ className }: CacheMetricsDisplayProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const cacheMetrics = useCacheMetrics()

  useEffect(() => {
    // Carregar métricas iniciais
    setMetrics(cacheMetrics.getMetrics())

    // Escutar atualizações
    const unsubscribe = cacheMetrics.addListener((newMetrics) => {
      setMetrics(newMetrics)
    })

    return unsubscribe
  }, [cacheMetrics])

  if (!metrics) return null

  const hitRate = cacheMetrics.getHitRate()
  const performanceScore = cacheMetrics.getPerformanceScore()
  const uptime = Date.now() - metrics.firstAccess

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHitRateColor = (rate: number): string => {
    if (rate >= 80) return 'bg-green-500'
    if (rate >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Métricas do Cache</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cacheMetrics.reset()}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Performance e estatísticas do sistema de cache
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{hitRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa de Acerto</div>
            <Progress 
              value={hitRate} 
              className="mt-2 h-2"
            />
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(performanceScore)}`}>
              {performanceScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Score Performance</div>
            <Progress 
              value={performanceScore} 
              className="mt-2 h-2"
            />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.activeTabs}</div>
            <div className="text-sm text-gray-600">Abas Ativas</div>
            <Network className="h-4 w-4 mx-auto mt-1 text-green-600" />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatSize(metrics.totalDataSize)}
            </div>
            <div className="text-sm text-gray-600">Tamanho Total</div>
            <HardDrive className="h-4 w-4 mx-auto mt-1 text-purple-600" />
          </div>
        </div>

        {/* Detalhes expandidos */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Operações */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Operações
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{metrics.hits}</div>
                  <div className="text-sm text-gray-600">Hits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{metrics.misses}</div>
                  <div className="text-sm text-gray-600">Misses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{metrics.sets}</div>
                  <div className="text-sm text-gray-600">Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{metrics.deletes}</div>
                  <div className="text-sm text-gray-600">Deletes</div>
                </div>
              </div>
            </div>

            {/* Tempos de operação */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Tempos Médios
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{metrics.averageLoadTime.toFixed(2)}ms</div>
                  <div className="text-sm text-gray-600">Carregamento</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{metrics.averageSaveTime.toFixed(2)}ms</div>
                  <div className="text-sm text-gray-600">Salvamento</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{metrics.averageCompressionTime.toFixed(2)}ms</div>
                  <div className="text-sm text-gray-600">Compressão</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{metrics.averageDecompressionTime.toFixed(2)}ms</div>
                  <div className="text-sm text-gray-600">Descompressão</div>
                </div>
              </div>
            </div>

            {/* Compressão */}
            {metrics.compressionRatio > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Compressão</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {metrics.compressionRatio.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Taxa de Compressão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {formatSize(metrics.compressedDataSize)}
                    </div>
                    <div className="text-sm text-gray-600">Tamanho Comprimido</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sincronização */}
            <div>
              <h4 className="font-semibold mb-2">Sincronização</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{metrics.syncMessagesSent}</div>
                  <div className="text-sm text-gray-600">Enviadas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{metrics.syncMessagesReceived}</div>
                  <div className="text-sm text-gray-600">Recebidas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{formatDuration(uptime)}</div>
                  <div className="text-sm text-gray-600">Tempo Ativo</div>
                </div>
              </div>
            </div>

            {/* Métricas por seção */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance por Seção
              </h4>
              <div className="space-y-2">
                {Object.entries(metrics.sectionMetrics).map(([section, sectionMetrics]: [string, any]) => {
                  const sectionHitRate = cacheMetrics.getSectionHitRate(section)
                  return (
                    <div key={section} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {section}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {sectionMetrics.hits + sectionMetrics.misses} operações
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-semibold">
                          {sectionHitRate.toFixed(1)}%
                        </div>
                        <Progress 
                          value={sectionHitRate} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
