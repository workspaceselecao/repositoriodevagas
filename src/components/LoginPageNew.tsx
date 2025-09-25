import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoginLayout, LoginForm } from './layouts/LoginLayout'
import { LoginFormData } from '../types/database'

export default function LoginPageNew() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('')
    setLoading(true)

    try {
      const success = await login(data)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Email ou senha incorretos')
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginLayout
      title="Repositório de Vagas"
      description="Sistema de gestão de vagas e candidatos"
    >
      <LoginForm
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
    </LoginLayout>
  )
}
