import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

export function SyncIndicator() {
  const { loading, refresh } = useData();
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLastSync(new Date());
    }
  }, [loading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = () => {
    if (loading || isRefreshing) {
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        label: 'Carregando...',
        description: 'Atualizando dados do servidor',
        animate: true,
      };
    }
    
    return {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      label: 'Conectado',
      description: `Última atualização: ${lastSync.toLocaleTimeString('pt-BR')}`,
    };
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

        {!loading && !isRefreshing && (
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
              <p className="text-sm">Atualizar dados</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}