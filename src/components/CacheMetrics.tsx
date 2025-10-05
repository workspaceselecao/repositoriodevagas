import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  HardDrive, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { cacheManager } from '@/lib/cacheManager';
import { 
  getCacheSize, 
  getAvailableSpace, 
  formatBytes,
  getCacheUsagePercent 
} from '@/lib/cacheUtils';
import { useDataCache } from '@/contexts/DataCacheContext';

interface CacheMetrics {
  totalSize: number;
  availableSpace: number;
  usagePercent: number;
  tables: {
    name: string;
    recordCount: number;
    lastSync: Date | null;
    version: string;
  }[];
}

export function CacheMetricsPage() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { refresh, invalidateCache } = useDataCache();

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    
    try {
      const [totalSize, availableSpace, usagePercent] = await Promise.all([
        getCacheSize(),
        getAvailableSpace(),
        getCacheUsagePercent(),
      ]);

      // Buscar metadados das tabelas
      const tables = await Promise.all(
        ['vagas', 'clientes'].map(async (tableName) => {
          const metadata = await cacheManager.getMetadata(tableName);
          return {
            name: tableName,
            recordCount: metadata?.recordCount || 0,
            lastSync: metadata?.lastSync ? new Date(metadata.lastSync) : null,
            version: metadata?.version || 'N/A',
          };
        })
      );

      setMetrics({
        totalSize,
        availableSpace,
        usagePercent,
        tables,
      });
    } catch (error) {
      console.error('Error loading cache metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshAll() {
    await refresh();
    await loadMetrics();
  }

  async function handleClearAll() {
    if (confirm('Tem certeza que deseja limpar todo o cache?')) {
      await invalidateCache();
      await loadMetrics();
    }
  }

  async function handleClearTable(tableName: string) {
    if (confirm(`Limpar cache da tabela ${tableName}?`)) {
      await invalidateCache(tableName);
      await loadMetrics();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Erro ao carregar métricas</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas do Cache</h1>
          <p className="text-muted-foreground">
            Monitoramento e gerenciamento do cache local
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleClearAll} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamanho do Cache
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.totalSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              de {formatBytes(metrics.availableSpace)} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Uso de Espaço
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.usagePercent}%</div>
            <Progress value={metrics.usagePercent} className="mt-2" />
            {metrics.usagePercent > 80 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Espaço quase cheio
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registros Totais
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.tables.reduce((sum, t) => sum + t.recordCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              em {metrics.tables.length} tabelas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle>Tabelas em Cache</CardTitle>
          <CardDescription>
            Informações detalhadas sobre cada tabela cacheada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.tables.map((table) => (
              <div
                key={table.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{table.name}</h3>
                    <Badge variant="secondary">
                      {table.recordCount} registros
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Última sincronização:{' '}
                      {table.lastSync
                        ? table.lastSync.toLocaleString('pt-BR')
                        : 'Nunca'}
                    </span>
                    <span>Versão: {table.version}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearTable(table.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Suporte IndexedDB:</span>
              <span className="ml-2 font-medium">
                {'indexedDB' in window ? 'Sim' : 'Não'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Storage API:</span>
              <span className="ml-2 font-medium">
                {'storage' in navigator ? 'Disponível' : 'Não disponível'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Versão do DB:</span>
              <span className="ml-2 font-medium">v1</span>
            </div>
            <div>
              <span className="text-muted-foreground">Navegador:</span>
              <span className="ml-2 font-medium">{navigator.userAgent.split(' ').pop()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
