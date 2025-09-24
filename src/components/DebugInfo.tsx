import { useAuth } from '../contexts/AuthContext'
import { useCache } from '../contexts/CacheContext'

export default function DebugInfo() {
  const { user, loading } = useAuth()
  const { cache, loading: cacheLoading } = useCache()

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Auth:</strong> {loading ? 'Loading...' : user ? `✅ ${user.email}` : '❌ No user'}</div>
        <div><strong>Cache:</strong> {cacheLoading ? 'Loading...' : '✅ Loaded'}</div>
        <div><strong>Vagas:</strong> {cache.vagas.length}</div>
        <div><strong>Clientes:</strong> {cache.clientes.length}</div>
        <div><strong>Last Updated:</strong> {new Date(cache.lastUpdated).toLocaleTimeString()}</div>
        <div><strong>Session:</strong> {user ? 'Active' : 'None'}</div>
      </div>
    </div>
  )
}
