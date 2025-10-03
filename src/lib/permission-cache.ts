// Sistema de Cache Seletivo por Permissões
// Gerencia cache baseado em roles e permissões do usuário

interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

interface UserPermissions {
  userId: string
  role: 'ADMIN' | 'RH'
  permissions: Permission[]
  cacheLevel: 'full' | 'limited' | 'none'
  expiresAt: number
}

interface CachePermission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
  ttl?: number
  priority: 'high' | 'medium' | 'low'
}

interface PermissionCacheEntry<T> {
  data: T
  permissions: string[]
  userId: string
  timestamp: number
  ttl: number
  accessCount: number
  lastAccess: number
}

class PermissionCache {
  private cache = new Map<string, PermissionCacheEntry<any>>()
  private userPermissions = new Map<string, UserPermissions>()
  private permissionRules = new Map<string, CachePermission>()
  private currentUser: any = null

  constructor() {
    this.initializePermissionRules()
  }

  // Inicializar regras de permissão para cache
  private initializePermissionRules(): void {
    // Regras para vagas
    this.permissionRules.set('vagas', {
      resource: 'vagas',
      actions: ['read', 'create', 'update', 'delete'],
      conditions: { role: ['ADMIN', 'RH'] },
      ttl: 15 * 60 * 1000, // 15 minutos
      priority: 'high'
    })

    // Regras para usuários (apenas ADMIN)
    this.permissionRules.set('usuarios', {
      resource: 'usuarios',
      actions: ['read', 'create', 'update', 'delete'],
      conditions: { role: ['ADMIN'] },
      ttl: 10 * 60 * 1000, // 10 minutos
      priority: 'high'
    })

    // Regras para notícias
    this.permissionRules.set('noticias', {
      resource: 'noticias',
      actions: ['read'],
      conditions: { role: ['ADMIN', 'RH'] },
      ttl: 5 * 60 * 1000, // 5 minutos
      priority: 'medium'
    })

    // Regras para configurações (apenas ADMIN)
    this.permissionRules.set('configuracoes', {
      resource: 'configuracoes',
      actions: ['read', 'update'],
      conditions: { role: ['ADMIN'] },
      ttl: 30 * 60 * 1000, // 30 minutos
      priority: 'low'
    })

    // Regras para relatórios
    this.permissionRules.set('relatorios', {
      resource: 'relatorios',
      actions: ['read', 'create'],
      conditions: { role: ['ADMIN', 'RH'] },
      ttl: 60 * 60 * 1000, // 1 hora
      priority: 'medium'
    })
  }

  // Definir usuário atual
  setCurrentUser(user: any): void {
    this.currentUser = user
    if (user) {
      this.loadUserPermissions(user.id, user.role)
    } else {
      this.clearUserCache()
    }
  }

  // Carregar permissões do usuário
  private loadUserPermissions(userId: string, role: string): void {
    const permissions = this.calculateUserPermissions(userId, role)
    const cacheLevel = this.determineCacheLevel(role, permissions)
    
    this.userPermissions.set(userId, {
      userId,
      role: role as 'ADMIN' | 'RH',
      permissions,
      cacheLevel,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    })

    console.log(`👤 Permissões carregadas para ${role}:`, { cacheLevel, permissions: permissions.length })
  }

  // Calcular permissões específicas do usuário
  private calculateUserPermissions(userId: string, role: string): Permission[] {
    const permissions: Permission[] = []

    for (const [resource, rule] of this.permissionRules.entries()) {
      if (this.userHasAccess(role, rule)) {
        rule.actions.forEach(action => {
          permissions.push({
            resource,
            action,
            conditions: rule.conditions
          })
        })
      }
    }

    return permissions
  }

  // Verificar se usuário tem acesso
  private userHasAccess(userRole: string, rule: CachePermission): boolean {
    if (!rule.conditions?.role) return true
    
    return rule.conditions.role.includes(userRole)
  }

  // Determinar nível de cache baseado no role
  private determineCacheLevel(role: string, permissions: Permission[]): 'full' | 'limited' | 'none' {
    switch (role) {
      case 'ADMIN':
        return 'full'
      case 'RH':
        return 'limited'
      default:
        return 'none'
    }
  }

  // Armazenar dados no cache com permissões
  set<T>(
    key: string,
    data: T,
    resource: string,
    options: {
      ttl?: number
      priority?: 'high' | 'medium' | 'low'
    } = {}
  ): void {
    if (!this.currentUser) {
      console.warn('⚠️ Usuário não definido, cache não armazenado')
      return
    }

    const userPerms = this.userPermissions.get(this.currentUser.id)
    if (!userPerms) {
      console.warn('⚠️ Permissões do usuário não encontradas')
      return
    }

    // Verificar se usuário tem permissão para este recurso
    const hasPermission = userPerms.permissions.some(perm => 
      perm.resource === resource && perm.action === 'read'
    )

    if (!hasPermission) {
      console.warn(`⚠️ Usuário não tem permissão para cache do recurso: ${resource}`)
      return
    }

    const rule = this.permissionRules.get(resource)
    const ttl = options.ttl || rule?.ttl || 15 * 60 * 1000
    const priority = options.priority || rule?.priority || 'medium'

    // Ajustar TTL baseado no nível de cache
    const adjustedTtl = this.adjustTtlByCacheLevel(ttl, userPerms.cacheLevel)

    const entry: PermissionCacheEntry<T> = {
      data,
      permissions: [resource],
      userId: this.currentUser.id,
      timestamp: Date.now(),
      ttl: adjustedTtl,
      accessCount: 0,
      lastAccess: Date.now()
    }

    this.cache.set(key, entry)
    console.log(`💾 Dados armazenados no cache com permissões: ${key}`)
  }

  // Recuperar dados do cache com verificação de permissões
  get<T>(key: string, resource: string): T | null {
    if (!this.currentUser) return null

    const entry = this.cache.get(key)
    if (!entry) return null

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    // Verificar permissões
    if (!this.hasPermission(entry, resource)) {
      console.warn(`🚫 Acesso negado ao cache: ${key}`)
      return null
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++
    entry.lastAccess = Date.now()

    console.log(`📖 Dados recuperados do cache com permissões: ${key}`)
    return entry.data
  }

  // Verificar se usuário tem permissão para acessar entrada
  private hasPermission(entry: PermissionCacheEntry<any>, resource: string): boolean {
    const userPerms = this.userPermissions.get(this.currentUser.id)
    if (!userPerms) return false

    // Verificar se é o próprio usuário ou tem permissão global
    if (entry.userId === this.currentUser.id) {
      return true
    }

    // Verificar permissões específicas
    const hasResourcePermission = userPerms.permissions.some(perm => 
      perm.resource === resource && perm.action === 'read'
    )

    return hasResourcePermission
  }

  // Verificar se entrada expirou
  private isExpired(entry: PermissionCacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  // Ajustar TTL baseado no nível de cache
  private adjustTtlByCacheLevel(baseTtl: number, cacheLevel: string): number {
    switch (cacheLevel) {
      case 'full':
        return baseTtl * 1.5 // 50% mais tempo para ADMIN
      case 'limited':
        return baseTtl * 0.8 // 20% menos tempo para RH
      case 'none':
        return 0 // Sem cache
      default:
        return baseTtl
    }
  }

  // Invalidar cache por usuário
  invalidateUserCache(userId?: string): void {
    const targetUserId = userId || this.currentUser?.id
    if (!targetUserId) return

    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.userId === targetUserId) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    console.log(`🗑️ Cache invalidado para usuário: ${targetUserId} (${keysToDelete.length} entradas)`)
  }

  // Invalidar cache por recurso
  invalidateResourceCache(resource: string, userId?: string): void {
    const targetUserId = userId || this.currentUser?.id
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.permissions.includes(resource) && 
          (!targetUserId || entry.userId === targetUserId)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })

    console.log(`🗑️ Cache invalidado para recurso: ${resource} (${keysToDelete.length} entradas)`)
  }

  // Limpar cache do usuário atual
  private clearUserCache(): void {
    if (!this.currentUser) return

    this.invalidateUserCache()
    this.userPermissions.delete(this.currentUser.id)
  }

  // Obter estatísticas do cache por usuário
  getStatsByUser(userId?: string): {
    totalEntries: number
    totalSize: number
    averageAccessCount: number
    oldestEntry: number
    newestEntry: number
    resources: Record<string, number>
  } {
    const targetUserId = userId || this.currentUser?.id
    if (!targetUserId) {
      return {
        totalEntries: 0,
        totalSize: 0,
        averageAccessCount: 0,
        oldestEntry: 0,
        newestEntry: 0,
        resources: {}
      }
    }

    const userEntries = Array.from(this.cache.values()).filter(entry => 
      entry.userId === targetUserId
    )

    const totalEntries = userEntries.length
    const totalSize = userEntries.reduce((sum, entry) => 
      sum + JSON.stringify(entry.data).length, 0
    )
    const totalAccessCount = userEntries.reduce((sum, entry) => 
      sum + entry.accessCount, 0
    )
    const averageAccessCount = totalEntries > 0 ? totalAccessCount / totalEntries : 0

    const timestamps = userEntries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0

    // Contar por recurso
    const resources: Record<string, number> = {}
    userEntries.forEach(entry => {
      entry.permissions.forEach(resource => {
        resources[resource] = (resources[resource] || 0) + 1
      })
    })

    return {
      totalEntries,
      totalSize,
      averageAccessCount,
      oldestEntry,
      newestEntry,
      resources
    }
  }

  // Obter estatísticas gerais do cache
  getStats(): {
    totalEntries: number
    totalUsers: number
    averageEntriesPerUser: number
    cacheLevels: Record<string, number>
    resources: Record<string, number>
  } {
    const entries = Array.from(this.cache.values())
    const users = new Set(entries.map(entry => entry.userId))
    
    const totalEntries = entries.length
    const totalUsers = users.size
    const averageEntriesPerUser = totalUsers > 0 ? totalEntries / totalUsers : 0

    // Contar por nível de cache
    const cacheLevels: Record<string, number> = {}
    for (const userId of users) {
      const userPerms = this.userPermissions.get(userId)
      if (userPerms) {
        cacheLevels[userPerms.cacheLevel] = (cacheLevels[userPerms.cacheLevel] || 0) + 1
      }
    }

    // Contar por recurso
    const resources: Record<string, number> = {}
    entries.forEach(entry => {
      entry.permissions.forEach(resource => {
        resources[resource] = (resources[resource] || 0) + 1
      })
    })

    return {
      totalEntries,
      totalUsers,
      averageEntriesPerUser,
      cacheLevels,
      resources
    }
  }

  // Limpeza de cache expirado
  cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache limpo: ${cleaned} entradas expiradas removidas`)
    }
  }

  // Limpeza por prioridade (quando cache está cheio)
  evictByPriority(): void {
    const entries = Array.from(this.cache.entries())
    
    // Ordenar por prioridade e último acesso
    entries.sort(([, a], [, b]) => {
      const priorityOrder = { low: 1, medium: 2, high: 3 }
      const aPriority = this.getEntryPriority(a)
      const bPriority = this.getEntryPriority(b)
      
      if (aPriority !== bPriority) {
        return priorityOrder[aPriority] - priorityOrder[bPriority]
      }
      
      return a.lastAccess - b.lastAccess
    })

    // Remover 20% das entradas com menor prioridade
    const toRemove = Math.ceil(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }

    console.log(`🗑️ ${toRemove} entradas removidas por prioridade`)
  }

  // Obter prioridade da entrada
  private getEntryPriority(entry: PermissionCacheEntry<any>): 'high' | 'medium' | 'low' {
    const resource = entry.permissions[0]
    const rule = this.permissionRules.get(resource)
    return rule?.priority || 'medium'
  }

  // Verificar se usuário pode acessar recurso
  canAccess(resource: string, action: string = 'read'): boolean {
    if (!this.currentUser) return false

    const userPerms = this.userPermissions.get(this.currentUser.id)
    if (!userPerms) return false

    return userPerms.permissions.some(perm => 
      perm.resource === resource && perm.action === action
    )
  }

  // Obter nível de cache do usuário atual
  getCurrentUserCacheLevel(): 'full' | 'limited' | 'none' {
    if (!this.currentUser) return 'none'

    const userPerms = this.userPermissions.get(this.currentUser.id)
    return userPerms?.cacheLevel || 'none'
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.userPermissions.clear()
    console.log('🗑️ Todo o cache de permissões foi limpo')
  }

  // Destruir instância
  destroy(): void {
    this.clear()
    this.currentUser = null
    console.log('💥 Permission cache destruído')
  }
}

// Singleton
let permissionCache: PermissionCache | null = null

export function getPermissionCache(): PermissionCache {
  if (!permissionCache) {
    permissionCache = new PermissionCache()
  }
  return permissionCache
}

// Hook para usar cache com permissões
export function usePermissionCache() {
  const cache = getPermissionCache()
  
  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    setCurrentUser: cache.setCurrentUser.bind(cache),
    invalidateUserCache: cache.invalidateUserCache.bind(cache),
    invalidateResourceCache: cache.invalidateResourceCache.bind(cache),
    getStatsByUser: cache.getStatsByUser.bind(cache),
    getStats: cache.getStats.bind(cache),
    canAccess: cache.canAccess.bind(cache),
    getCurrentUserCacheLevel: cache.getCurrentUserCacheLevel.bind(cache),
    cleanup: cache.cleanup.bind(cache),
    evictByPriority: cache.evictByPriority.bind(cache),
    clear: cache.clear.bind(cache),
    destroy: cache.destroy.bind(cache)
  }
}
