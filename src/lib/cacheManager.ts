import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheDB extends DBSchema {
  vagas: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'timestamp': number };
  };
  clientes: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'timestamp': number };
  };
  metadata: {
    key: string;
    value: {
      table: string;
      version: string;
      lastSync: number;
      recordCount: number;
    };
  };
}

type TableName = 'vagas' | 'clientes' | 'metadata';

class CacheManager {
  private db: IDBPDatabase<CacheDB> | null = null;
  private readonly DB_NAME = 'repositorio-vagas-cache';
  private readonly DB_VERSION = 1;
  private readonly CACHE_DURATION = 3600000; // 1 hora
  private readonly userId: string | null = null;

  constructor() {
    // Em uma implementação real, você obteria o userId do contexto de autenticação
    // Por enquanto, vamos usar um identificador único baseado no navegador
    this.userId = this.generateUserId();
  }

  private generateUserId(): string {
    // Gerar um ID único baseado no navegador
    return `user-${navigator.userAgent.slice(-8)}-${Date.now().toString(36)}`;
  }

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<CacheDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Store para vagas
          if (!db.objectStoreNames.contains('vagas')) {
            const vagasStore = db.createObjectStore('vagas', { keyPath: 'id' });
            vagasStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store para clientes
          if (!db.objectStoreNames.contains('clientes')) {
            const clientesStore = db.createObjectStore('clientes', { keyPath: 'id' });
            clientesStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store para metadata
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'table' });
          }
        },
      });

      console.log('[CacheManager] Initialized successfully');
    } catch (error) {
      console.error('[CacheManager] Initialization error:', error);
      throw error;
    }
  }

  async saveTable(tableName: string, data: any[]): Promise<void> {
    if (!this.db) await this.init();

    const tableNameTyped = tableName as TableName;
    const tx = this.db!.transaction([tableNameTyped, 'metadata'], 'readwrite');
    const timestamp = Date.now();

    try {
      // Limpar dados antigos
      await tx.objectStore(tableNameTyped).clear();

      // Salvar novos dados
      await Promise.all(
        data.map(item =>
          tx.objectStore(tableNameTyped).put({
            id: `${this.userId}-${tableName}-${item.id}`,
            data: item,
            timestamp,
          })
        )
      );

      // Atualizar metadata
      await tx.objectStore('metadata').put({
        table: tableName,
        version: await this.generateVersion(data),
        lastSync: timestamp,
        recordCount: data.length,
      });

      await tx.done;
      console.log(`[CacheManager] Saved ${data.length} records to ${tableName}`);
    } catch (error) {
      console.error(`[CacheManager] Error saving to ${tableName}:`, error);
      throw error;
    }
  }

  async getTable(tableName: string): Promise<any[] | null> {
    if (!this.db) await this.init();

    try {
      const metadata = await this.db!.get('metadata', tableName);
      
      if (!metadata) {
        console.log(`[CacheManager] No cache for ${tableName}`);
        return null;
      }

      // Verificar se cache é válido (< 1 hora)
      if (!this.isCacheValid(metadata.lastSync)) {
        console.log(`[CacheManager] Cache expired for ${tableName}`);
        return null;
      }

      // Buscar apenas registros do usuário atual
      const tableNameTyped = tableName as TableName;
      const allRecords = await this.db!.getAll(tableNameTyped);
      const userRecords = allRecords.filter(record => 
        'id' in record && record.id.startsWith(`${this.userId}-${tableName}-`)
      );
      
      const tableRecords = userRecords.map(record => 'data' in record ? record.data : record);

      console.log(`[CacheManager] Retrieved ${tableRecords.length} records from ${tableName}`);
      return tableRecords;
    } catch (error) {
      console.error(`[CacheManager] Error getting ${tableName}:`, error);
      return null;
    }
  }

  async updateRecord(tableName: string, record: any): Promise<void> {
    if (!this.db) await this.init();

    try {
      const timestamp = Date.now();
      const tableNameTyped = tableName as TableName;
      await this.db!.put(tableNameTyped, {
        id: `${this.userId}-${tableName}-${record.id}`,
        data: record,
        timestamp,
      });

      console.log(`[CacheManager] Updated record in ${tableName}:`, record.id);
    } catch (error) {
      console.error(`[CacheManager] Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  async deleteRecord(tableName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      const tableNameTyped = tableName as TableName;
      await this.db!.delete(tableNameTyped, `${this.userId}-${tableName}-${id}`);
      console.log(`[CacheManager] Deleted record from ${tableName}:`, id);
    } catch (error) {
      console.error(`[CacheManager] Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }

  async clear(tableName?: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      if (tableName) {
        // Limpar apenas registros do usuário atual para a tabela específica
        const tableNameTyped = tableName as TableName;
        const allRecords = await this.db!.getAll(tableNameTyped);
        const userRecords = allRecords.filter(record => 
          'id' in record && record.id.startsWith(`${this.userId}-${tableName}-`)
        );
        
        await Promise.all(
          userRecords.map(record => 'id' in record ? this.db!.delete(tableNameTyped, record.id) : Promise.resolve())
        );
        
        await this.db!.delete('metadata', tableName);
        console.log(`[CacheManager] Cleared cache for ${tableName}`);
      } else {
        // Limpar todos os registros do usuário atual
        const tables: TableName[] = ['vagas', 'clientes'];
        for (const table of tables) {
          const allRecords = await this.db!.getAll(table);
          const userRecords = allRecords.filter(record => 
            'id' in record && record.id.startsWith(`${this.userId}-${table}-`)
          );
          
          await Promise.all(
            userRecords.map(record => 'id' in record ? this.db!.delete(table, record.id) : Promise.resolve())
          );
        }
        
        await this.db!.clear('metadata');
        console.log('[CacheManager] Cleared all cache');
      }
    } catch (error) {
      console.error('[CacheManager] Error clearing cache:', error);
      throw error;
    }
  }

  async getMetadata(tableName: string): Promise<any> {
    if (!this.db) await this.init();
    return await this.db!.get('metadata', tableName);
  }

  private async generateVersion(data: any[]): Promise<string> {
    // Gerar hash simples dos dados para versionamento
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private isCacheValid(lastSync: number): boolean {
    return Date.now() - lastSync < this.CACHE_DURATION;
  }

  // Método para verificar se o cache está disponível
  isSupported(): boolean {
    return 'indexedDB' in window;
  }

  // Método para obter informações de debug
  async getDebugInfo(): Promise<any> {
    if (!this.db) await this.init();

    try {
      const metadata = await Promise.all([
        this.db!.get('metadata', 'vagas'),
        this.db!.get('metadata', 'clientes'),
      ]);

      const [vagasMeta, clientesMeta] = metadata;

      return {
        userId: this.userId,
        dbName: this.DB_NAME,
        dbVersion: this.DB_VERSION,
        cacheDuration: this.CACHE_DURATION,
        supported: this.isSupported(),
        tables: {
          vagas: vagasMeta,
          clientes: clientesMeta,
        },
      };
    } catch (error) {
      console.error('[CacheManager] Error getting debug info:', error);
      return null;
    }
  }
}

export const cacheManager = new CacheManager();
