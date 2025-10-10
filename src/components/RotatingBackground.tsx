import { useState, useEffect } from 'react'

interface RotatingBackgroundProps {
  className?: string
  autoRotate?: boolean
  rotationInterval?: number
}

export default function RotatingBackground({ 
  className = '',
  autoRotate = true,
  rotationInterval = 10000 // 10 segundos por padrão
}: RotatingBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Lista de imagens de background
  const backgroundImages = [
    '/backhome/Slide1.PNG',
    '/backhome/Slide2.PNG',
    '/backhome/Slide3.PNG',
    '/backhome/Slide4.PNG',
    '/backhome/Slide5.PNG'
  ]

  // Função para selecionar uma imagem aleatória
  const selectRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setCurrentImageIndex(randomIndex)
  }

  // Função para alternar para próxima imagem
  const nextImage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
      setIsTransitioning(false)
    }, 500) // Duração da transição
  }

  // Selecionar imagem aleatória na inicialização
  useEffect(() => {
    selectRandomImage()
  }, [])

  // Rotação automática se habilitada
  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      nextImage()
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, rotationInterval])

  return (
    <div 
      className={`fixed inset-0 w-full h-full -z-10 transition-opacity duration-500 ${className}`}
      style={{
        backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isTransitioning ? 0.2 : 0.3 // Opacidade reduzida durante transição
      }}
    />
  )
}
