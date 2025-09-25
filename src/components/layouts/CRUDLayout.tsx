import React from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '../ui/dropdown-menu'
import { DashboardLayout } from './DashboardLayout'
import { cn } from '../../lib/utils'

interface CRUDLayoutProps {
  title: string
  description?: string
  breadcrumbs: Array<{ label: string; href?: string }>
  children: React.ReactNode
  actions?: React.ReactNode
  searchable?: boolean
  filterable?: boolean
  onCreate?: () => void
  onExport?: () => void
  onImport?: () => void
  loading?: boolean
}

export function CRUDLayout({
  title,
  description,
  breadcrumbs,
  children,
  actions,
  searchable = true,
  filterable = true,
  onCreate,
  onExport,
  onImport,
  loading = false
}: CRUDLayoutProps) {
  const [searchTerm, setSearchTerm] = React.useState('')

  return (
    <DashboardLayout title={title} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            
            {/* Import/Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Mais ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onImport && (
                  <DropdownMenuItem onClick={onImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </DropdownMenuItem>
                )}
                {(onImport || onExport) && <DropdownMenuSeparator />}
                <DropdownMenuItem>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros avançados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Button */}
            {onCreate && (
              <Button onClick={onCreate} className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters and Search */}
        {(searchable || filterable) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {searchable && (
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}

                  {filterable && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                      <Button variant="outline" size="sm">
                        Ordenar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

// Componente específico para lista de itens
interface ItemListProps {
  items: Array<{
    id: string
    title: string
    description?: string
    status?: 'active' | 'inactive' | 'pending'
    createdAt?: string
    updatedAt?: string
  }>
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  loading?: boolean
}

export function ItemList({ items, onEdit, onDelete, onView, loading }: ItemListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-8 bg-muted rounded w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">
                Não há itens para exibir no momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
                    {item.status && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        item.status === 'active' && "bg-green-100 text-green-800",
                        item.status === 'inactive' && "bg-red-100 text-red-800",
                        item.status === 'pending' && "bg-yellow-100 text-yellow-800"
                      )}>
                        {item.status === 'active' && 'Ativo'}
                        {item.status === 'inactive' && 'Inativo'}
                        {item.status === 'pending' && 'Pendente'}
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-muted-foreground">{item.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {item.createdAt && (
                      <span>Criado em {new Date(item.createdAt).toLocaleDateString()}</span>
                    )}
                    {item.updatedAt && (
                      <span>Atualizado em {new Date(item.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// Componente para formulário CRUD
interface CRUDFormProps {
  title: string
  children: React.ReactNode
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
  submitLabel?: string
  cancelLabel?: string
}

export function CRUDForm({
  title,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar'
}: CRUDFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você coletaria os dados do formulário
    onSubmit({})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
