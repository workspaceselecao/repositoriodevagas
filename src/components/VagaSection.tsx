import { useThemeClasses } from '../hooks/useThemeClasses'

interface VagaSectionProps {
  title: string
  content?: string
  children?: React.ReactNode
}

export default function VagaSection({ title, content, children }: VagaSectionProps) {
  const { textClasses } = useThemeClasses()
  
  return (
    <div className="space-y-4">
      <h2 className={textClasses.heading}>
        {title}
      </h2>
      <div className={`${textClasses.secondary} leading-relaxed`}>
        {content ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : children ? (
          children
        ) : (
          <p className={`${textClasses.muted} italic`}>Informação não disponível</p>
        )}
      </div>
    </div>
  )
}
