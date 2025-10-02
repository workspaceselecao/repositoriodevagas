import React, { useState, useEffect } from 'react'
import { useCache } from '../contexts/CacheContext'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function CacheDebugPanel() {
  const { cache, loading, cacheStatus, forceInitialLoad, refreshAll } = useCache()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    setLastUpdate(new Date())
  }, [cache.lastUpdated])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Database className="h-4 w-4 mr-2" />
          Debug Cache
        </Button>
      </div>
    )
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean, count: number) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="ml-2">
        {count} {status ? 'OK' : 'ERRO'}
      </Badge>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Debug Cache
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Usuário: {user?.email} | Última atualização: {lastUpdate?.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Status das seções */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status das Seções:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.vagas)}
                  Vagas
                </span>
                {getStatusBadge(cacheStatus.vagas, cache.vagas.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.clientes)}
                  Clientes
                </span>
                {getStatusBadge(cacheStatus.clientes, cache.clientes.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.sites)}
                  Sites
                </span>
                {getStatusBadge(cacheStatus.sites, cache.sites.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.categorias)}
                  Categorias
                </span>
                {getStatusBadge(cacheStatus.categorias, cache.categorias.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.cargos)}
                  Cargos
                </span>
                {getStatusBadge(cacheStatus.cargos, cache.cargos.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.celulas)}
                  Células
                </span>
                {getStatusBadge(cacheStatus.celulas, cache.celulas.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.usuarios)}
                  Usuários
                </span>
                {getStatusBadge(cacheStatus.usuarios, cache.usuarios.length)}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStatusIcon(cacheStatus.noticias)}
                  Notícias
                </span>
                {getStatusBadge(cacheStatus.noticias, cache.noticias.length)}
              </div>
            </div>
          </div>

          {/* Status geral */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                {loading ? (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                Status Geral
              </span>
              <Badge variant={loading ? "secondary" : "default"}>
                {loading ? 'Carregando...' : 'Pronto'}
              </Badge>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-2 border-t space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={forceInitialLoad}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Forçar Carregamento
              </Button>
              <Button
                onClick={refreshAll}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar Cache
              </Button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div>Cache ID: {user?.id?.substring(0, 8)}...</div>
            <div>Última atualização: {new Date(cache.lastUpdated).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
