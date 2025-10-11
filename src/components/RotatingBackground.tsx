import { useState, useEffect } from 'react'

interface RotatingBackgroundProps {
  className?: string
}

export default function RotatingBackground({ className = '' }: RotatingBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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

  // Selecionar imagem aleatória apenas na inicialização
  useEffect(() => {
    selectRandomImage()
  }, [])

  return (
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
  )
}
