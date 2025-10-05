import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useDataCache } from '@/contexts/DataCacheContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

export function SyncIndicator() {
  const { syncStatus, refresh } = useDataCache();
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (syncStatus === 'synced') {
      setLastSync(new Date());
    }
  }, [syncStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950',
          label: 'Sincronizado',
          description: `Última sincronização: ${lastSync.toLocaleTimeString('pt-BR')}`,
        };
      case 'syncing':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          label: 'Sincronizando...',
          description: 'Atualizando dados do servidor',
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950',
          label: 'Erro na sincronização',
          description: 'Problema na conexão com o servidor. Clique para tentar novamente.',
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          label: 'Aguardando',
          description: 'Sistema iniciando...',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} transition-all`}
            >
              <Icon
                className={`h-4 w-4 ${config.color} ${
                  config.animate ? 'animate-spin' : ''
                }`}
              />
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{config.description}</p>
          </TooltipContent>
        </Tooltip>

        {syncStatus === 'synced' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Forçar sincronização</p>
            </TooltipContent>
          </Tooltip>
        )}

        {syncStatus === 'error' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <RefreshCw
                  className={`h-4 w-4 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Tentar novamente</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
