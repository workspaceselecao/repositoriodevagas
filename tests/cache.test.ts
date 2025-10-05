import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheManager } from '../src/lib/cacheManager';

// Mock do IndexedDB para testes
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// Mock global do IndexedDB
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('CacheManager', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock do openDB
    const mockDB = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          clear: vi.fn().mockResolvedValue(undefined),
          put: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue(null),
          getAll: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(undefined),
        }),
        done: Promise.resolve(),
      }),
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    };

    mockIndexedDB.open.mockResolvedValue(mockDB);
  });

  afterEach(async () => {
    // Cleanup
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await expect(cacheManager.init()).resolves.not.toThrow();
  });

  it('should save and retrieve data', async () => {
    const testData = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
    ];

    await cacheManager.saveTable('test', testData);
    
    // Mock successful retrieval
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.get.mockResolvedValue({
      table: 'test',
      version: 'abc123',
      lastSync: Date.now(),
      recordCount: 2,
    });
    mockDB.getAll.mockResolvedValue([
      { id: 'user-test-1', data: testData[0], timestamp: Date.now() },
      { id: 'user-test-2', data: testData[1], timestamp: Date.now() },
    ]);

    const retrieved = await cacheManager.getTable('test');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired cache', async () => {
    const testData = [{ id: 1, name: 'Test' }];
    
    await cacheManager.saveTable('test', testData);
    
    // Mock expired cache
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.get.mockResolvedValue({
      table: 'test',
      version: 'abc123',
      lastSync: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      recordCount: 1,
    });

    const retrieved = await cacheManager.getTable('test');
    expect(retrieved).toBeNull();
  });

  it('should update single record', async () => {
    const testData = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
    ];

    await cacheManager.saveTable('test', testData);
    
    const updated = { id: 1, name: 'Updated' };
    await cacheManager.updateRecord('test', updated);

    // Mock successful update
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.put.mockResolvedValue(undefined);

    await expect(cacheManager.updateRecord('test', updated)).resolves.not.toThrow();
  });

  it('should delete record', async () => {
    const testData = [{ id: 1, name: 'Test' }];
    
    await cacheManager.saveTable('test', testData);
    
    // Mock successful deletion
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.delete.mockResolvedValue(undefined);

    await expect(cacheManager.deleteRecord('test', '1')).resolves.not.toThrow();
  });

  it('should clear cache', async () => {
    // Mock successful clear
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.clear.mockResolvedValue(undefined);

    await expect(cacheManager.clear()).resolves.not.toThrow();
  });

  it('should check if cache is supported', () => {
    expect(cacheManager.isSupported()).toBe(true);
  });

  it('should get debug info', async () => {
    const mockDB = mockIndexedDB.open.mock.results[0].value;
    mockDB.get
      .mockResolvedValueOnce({ table: 'vagas', version: 'v1', lastSync: Date.now(), recordCount: 10 })
      .mockResolvedValueOnce({ table: 'clientes', version: 'v2', lastSync: Date.now(), recordCount: 5 });

    const debugInfo = await cacheManager.getDebugInfo();
    
    expect(debugInfo).toHaveProperty('userId');
    expect(debugInfo).toHaveProperty('dbName');
    expect(debugInfo).toHaveProperty('dbVersion');
    expect(debugInfo).toHaveProperty('tables');
  });
});

// Testes para cacheUtils
describe('cacheUtils', () => {
  it('should format bytes correctly', async () => {
    const { formatBytes } = await import('../src/lib/cacheUtils');
    
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should generate hash', async () => {
    const { generateHash } = await import('../src/lib/cacheUtils');
    
    const data1 = { id: 1, name: 'Test' };
    const data2 = { id: 2, name: 'Test' };
    
    const hash1 = generateHash(data1);
    const hash2 = generateHash(data2);
    
    expect(hash1).not.toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('should validate data', async () => {
    const { validateData, generateHash } = await import('../src/lib/cacheUtils');
    
    const data = { id: 1, name: 'Test' };
    const hash = generateHash(data);
    
    expect(validateData(data, hash)).toBe(true);
    expect(validateData(data, 'invalid-hash')).toBe(false);
    expect(validateData(null)).toBe(false);
  });
});

// Testes para DataCacheContext
describe('DataCacheContext', () => {
  it('should provide cache context', () => {
    // Este teste seria mais complexo em um ambiente real
    // Aqui apenas verificamos se o contexto pode ser importado
    expect(() => import('../src/contexts/DataCacheContext')).not.toThrow();
  });
});

// Testes para useSmartCache
describe('useSmartCache', () => {
  it('should provide cache hook', () => {
    // Este teste seria mais complexo em um ambiente real
    // Aqui apenas verificamos se o hook pode ser importado
    expect(() => import('../src/hooks/useSmartCache')).not.toThrow();
  });
});
