import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { User, UserFormData } from '../types/database'
import { getAllUsers, createUser, updateUser, deleteUser, resetUserPassword } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'
import { Users, UserPlus, Edit, Trash2, Key, Search, AlertTriangle } from 'lucide-react'

export default function GerenciarUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  
  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'RH'
  })

  const { user: currentUser } = useAuth()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setLoading(true)
        const data = await getAllUsers()
        if (isMounted) {
          setUsers(data)
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setMessage('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const newUser = await createUser(userForm)
      if (newUser) {
        setMessage('Usuário criado com sucesso!')
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'RH'
        })
        setShowCreateDialog(false)
        loadUsers()
      } else {
        setMessage('Erro ao criar usuário')
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      setMessage(`Erro ao criar usuário: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setMessage('')

    try {
      const updatedUser = await updateUser(editingUser.id, userForm)
      if (updatedUser) {
        setMessage('Usuário atualizado com sucesso!')
        setShowEditDialog(false)
        setEditingUser(null)
        loadUsers()
      } else {
        setMessage('Erro ao atualizar usuário')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      setMessage(`Erro ao atualizar usuário: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setLoading(true)
    setMessage('')

    try {
      const success = await deleteUser(userToDelete.id)
      if (success) {
        setMessage('Usuário excluído com sucesso!')
        setShowDeleteDialog(false)
        setUserToDelete(null)
        loadUsers()
      } else {
        setMessage('Erro ao excluir usuário')
      }
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      setMessage(`Erro ao excluir usuário: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return

    setLoading(true)
    setMessage('')

    try {
      const success = await resetUserPassword(userToResetPassword.id, newPassword)
      if (success) {
        setMessage('Senha redefinida com sucesso!')
        setShowResetPasswordDialog(false)
        setUserToResetPassword(null)
        setNewPassword('')
      } else {
        setMessage('Erro ao redefinir senha')
      }
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      setMessage(`Erro ao redefinir senha: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Não mostrar senha atual
      role: user.role
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const openResetPasswordDialog = (user: User) => {
    setUserToResetPassword(user)
    setNewPassword('')
    setShowResetPasswordDialog(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold page-title">Gerenciar Usuários</h1>
          <p className="page-subtitle mt-2">
            Gerencie usuários do sistema, suas permissões e configurações
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo usuário no sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userForm.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleInputChange}
                    placeholder="Senha temporária"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Usuário</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value: 'ADMIN' | 'RH') => 
                      setUserForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RH">RH - Recursos Humanos</SelectItem>
                      <SelectItem value="ADMIN">ADMIN - Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''} no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <span className="ml-2">Carregando usuários...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário cadastrado'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          Criado em {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'ADMIN' ? 'Administrador' : 'Recursos Humanos'}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openResetPasswordDialog(user)}
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.id === currentUser?.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={userForm.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Tipo de Usuário</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value: 'ADMIN' | 'RH') => 
                    setUserForm(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RH">RH - Recursos Humanos</SelectItem>
                    <SelectItem value="ADMIN">ADMIN - Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Redefinir Senha */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Digite uma nova senha para o usuário <strong>{userToResetPassword?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleResetPassword}
              disabled={loading || !newPassword}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
