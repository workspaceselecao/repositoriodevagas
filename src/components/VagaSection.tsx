import { useThemeClasses } from '../hooks/useThemeClasses'

interface VagaSectionProps {
  title: string
  content?: string
  children?: React.ReactNode
}

export default function VagaSection({ title, content, children }: VagaSectionProps) {
  const { textClasses } = useThemeClasses()
  
  // Função para renderizar conteúdo formatado
  const renderFormattedContent = (text: string) => {
    if (!text) return null
    
    return (
      <div className="whitespace-pre-wrap space-y-2">
        {text.split('\n').map((line, index) => {
          const trimmedLine = line.trim()
          
          // Se a linha está vazia, renderizar como espaço
          if (!trimmedLine) {
            return <div key={index} className="h-2" />
          }
          
          // Se a linha começa com marcador, renderizar como lista
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
            return (
              <div key={index} className="flex items-start">
                <span className="text-primary mr-2 mt-1 flex-shrink-0">•</span>
                <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
              </div>
            )
          }
          
          // Se a linha começa com número (lista numerada)
          if (/^\d+\.\s/.test(trimmedLine)) {
            return (
              <div key={index} className="flex items-start">
                <span className="text-primary mr-2 mt-1 flex-shrink-0 font-semibold">
                  {trimmedLine.match(/^\d+/)?.[0]}.
                </span>
                <span className="flex-1">{trimmedLine.replace(/^\d+\.\s/, '').trim()}</span>
              </div>
            )
          }
          
          // Linha normal
          return (
            <div key={index} className="leading-relaxed">
              {trimmedLine}
            </div>
          )
        })}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <h2 className={`${textClasses.primary} text-xl font-bold uppercase tracking-wide border-b border-border/50 pb-2`}>
        {title}
      </h2>
      <div className={`${textClasses.primary} leading-relaxed`}>
        {content ? (
          renderFormattedContent(content)
        ) : children ? (
          children
        ) : (
          <p className={`${textClasses.primary} italic`}>Informação não disponível</p>
        )}
      </div>
    </div>
  )
}
