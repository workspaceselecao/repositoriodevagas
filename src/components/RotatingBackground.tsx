import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface RotatingBackgroundProps {
  className?: string
}

export default function RotatingBackground({ className = '' }: RotatingBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showArrow, setShowArrow] = useState(false)
  
  // Lista de imagens de background disponíveis
  const backgroundImages = [
    '/backhome/BLUE.PNG',
    '/backhome/GREEN.PNG',
    '/backhome/ORANGE.PNG'
  ]

  // Função para selecionar uma imagem aleatória
  const selectRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setCurrentImageIndex(randomIndex)
  }

  // Função para navegar para próxima imagem
  const nextImage = () => {
    setCurrentImageIndex((prev: number) => (prev + 1) % backgroundImages.length)
  }

  // Selecionar imagem aleatória apenas na inicialização
  useEffect(() => {
    selectRandomImage()
  }, [])

  return (
    <>
      <div 
        className={`fixed inset-0 w-full h-full -z-10 ${className}`}
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6 // Opacidade para boa visibilidade
        }}
      />
      
      {/* Seta discreta para navegação manual */}
      <button
        className={`fixed bottom-4 right-4 z-30 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-white hover:bg-black/30 transition-all duration-300 group ${showArrow ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
        onClick={nextImage}
        onMouseEnter={() => setShowArrow(true)}
        onMouseLeave={() => setShowArrow(false)}
        title="Alterar imagem de fundo"
      >
        <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </>
  )
}
