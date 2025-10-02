import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import VagaTemplate from './VagaTemplate'
import { Vaga } from '../types/database'
import { getVagaById, deleteVaga } from '../lib/vagas'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from './ui/button'

export default function VagaView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadVaga()
    }
  }, [id])

  const loadVaga = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getVagaById(id!)
      if (data) {
        setVaga(data)
      } else {
        setError('Oportunidade não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar vaga:', error)
      setError('Erro ao carregar vaga')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/dashboard/editar-vaga/${id}`)
  }

  const handleDelete = async () => {
    if (user?.role !== 'ADMIN') {
      alert('Apenas administradores podem excluir vagas')
      return
    }

    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        const success = await deleteVaga(id!)
        if (success) {
          navigate('/dashboard/lista-clientes')
        } else {
          alert('Erro ao excluir vaga')
        }
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
        alert('Erro ao excluir vaga')
      }
    }
  }

  const handleBack = () => {
    navigate('/dashboard/lista-clientes')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-contrast-primary">Carregando vaga...</p>
        </div>
      </div>
    )
  }

  if (error || !vaga) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-contrast-primary mb-4">Oportunidade não encontrada</h1>
          <p className="text-contrast-primary mb-6">{error}</p>
          <Button 
            onClick={handleBack}
            className="transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 hover:-translate-x-1" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com navegação */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 hover:-translate-x-1" />
            Voltar para Lista de Oportunidades
          </Button>
        </div>
      </div>

      {/* Template da Oportunidade */}
      <div className="py-8">
        <VagaTemplate 
          vaga={vaga}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={user?.role === 'ADMIN'}
        />
      </div>
    </div>
  )
}
