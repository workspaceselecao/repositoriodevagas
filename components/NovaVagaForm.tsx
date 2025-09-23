'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VagaFormData } from '@/types/database'
import { createVaga } from '@/lib/vagas'
import { Plus, ArrowLeft } from 'lucide-react'

export default function NovaVagaForm() {
  const [formData, setFormData] = useState<VagaFormData>({
    site: '',
    categoria: '',
    cargo: '',
    cliente: '',
    produto: '',
    descricao_vaga: '',
    responsabilidades_atribuicoes: '',
    requisitos_qualificacoes: '',
    salario: '',
    horario_trabalho: '',
    jornada_trabalho: '',
    beneficios: '',
    local_trabalho: '',
    etapas_processo: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const novaVaga = await createVaga(formData, user.id)
      if (novaVaga) {
        setMessage('Vaga criada com sucesso!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage('Erro ao criar vaga')
      }
    } catch (error) {
      setMessage('Erro ao criar vaga')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Vaga</h1>
          <p className="text-gray-600 mt-2">
            Adicione uma nova vaga ao sistema
          </p>
        </div>
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

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Informações da Vaga
          </CardTitle>
          <CardDescription>
            Preencha todas as informações necessárias sobre a vaga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  placeholder="Ex: São Bento, Casa, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  placeholder="Ex: Operações"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  placeholder="Ex: Especialista I"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  placeholder="Ex: VIVO, REDE, etc."
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="produto">Produto</Label>
                <Input
                  id="produto"
                  name="produto"
                  value={formData.produto}
                  onChange={handleInputChange}
                  placeholder="Ex: VIVO - Telecom I"
                  required
                />
              </div>
            </div>

            {/* Descrição da Vaga */}
            <div className="space-y-2">
              <Label htmlFor="descricao_vaga">Descrição da Vaga</Label>
              <textarea
                id="descricao_vaga"
                name="descricao_vaga"
                value={formData.descricao_vaga}
                onChange={handleInputChange}
                placeholder="Descreva a vaga..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Responsabilidades */}
            <div className="space-y-2">
              <Label htmlFor="responsabilidades_atribuicoes">Responsabilidades e Atribuições</Label>
              <textarea
                id="responsabilidades_atribuicoes"
                name="responsabilidades_atribuicoes"
                value={formData.responsabilidades_atribuicoes}
                onChange={handleInputChange}
                placeholder="Liste as responsabilidades..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requisitos_qualificacoes">Requisitos e Qualificações</Label>
              <textarea
                id="requisitos_qualificacoes"
                name="requisitos_qualificacoes"
                value={formData.requisitos_qualificacoes}
                onChange={handleInputChange}
                placeholder="Liste os requisitos..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  name="salario"
                  value={formData.salario}
                  onChange={handleInputChange}
                  placeholder="Ex: R$ 1.518,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario_trabalho">Horário de Trabalho</Label>
                <Input
                  id="horario_trabalho"
                  name="horario_trabalho"
                  value={formData.horario_trabalho}
                  onChange={handleInputChange}
                  placeholder="Ex: Das 09:00 às 18:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jornada_trabalho">Jornada de Trabalho</Label>
                <Input
                  id="jornada_trabalho"
                  name="jornada_trabalho"
                  value={formData.jornada_trabalho}
                  onChange={handleInputChange}
                  placeholder="Ex: 180h mês | Escala 5x2"
                />
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <Label htmlFor="beneficios">Benefícios</Label>
              <textarea
                id="beneficios"
                name="beneficios"
                value={formData.beneficios}
                onChange={handleInputChange}
                placeholder="Liste os benefícios..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Local de Trabalho */}
            <div className="space-y-2">
              <Label htmlFor="local_trabalho">Local de Trabalho</Label>
              <textarea
                id="local_trabalho"
                name="local_trabalho"
                value={formData.local_trabalho}
                onChange={handleInputChange}
                placeholder="Endereço e localização..."
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Etapas do Processo */}
            <div className="space-y-2">
              <Label htmlFor="etapas_processo">Etapas do Processo</Label>
              <textarea
                id="etapas_processo"
                name="etapas_processo"
                value={formData.etapas_processo}
                onChange={handleInputChange}
                placeholder="Liste as etapas do processo seletivo..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Criar Vaga'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
