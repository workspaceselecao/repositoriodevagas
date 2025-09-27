import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { 
  Download, 
  Monitor,
  Smartphone,
  ExternalLink,
  Globe
} from 'lucide-react'

interface InstallInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const isChrome = navigator.userAgent.includes('Chrome')
  const isEdge = navigator.userAgent.includes('Edg')
  const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
  const isFirefox = navigator.userAgent.includes('Firefox')

  const getBrowserIcon = () => {
    if (isChrome) return <Globe className="h-6 w-6 text-blue-500" />
    if (isEdge) return <Globe className="h-6 w-6 text-blue-600" />
    if (isSafari) return <Globe className="h-6 w-6 text-blue-400" />
    if (isFirefox) return <Globe className="h-6 w-6 text-orange-500" />
    return <Monitor className="h-6 w-6 text-gray-500" />
  }

  const getBrowserName = () => {
    if (isChrome) return 'Chrome'
    if (isEdge) return 'Edge'
    if (isSafari) return 'Safari'
    if (isFirefox) return 'Firefox'
    return 'Seu Navegador'
  }

  const getInstructions = () => {
    if (isChrome || isEdge) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              MÉTODO 1 - Menu do Navegador
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Clique nos <strong>3 pontos (⋮)</strong> no canto superior direito</li>
              <li>Procure por <strong>"Instalar Repositório de Vagas"</strong> ou <strong>"Instalar aplicativo"</strong></li>
              <li>Clique em <strong>"Instalar"</strong></li>
            </ol>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              MÉTODO 2 - Barra de Endereços
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
              <li>Procure pelo <strong>ícone de instalação</strong> na barra de endereços</li>
              <li>Clique no ícone (parece um download ou +)</li>
              <li>Confirme a instalação</li>
            </ol>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              MÉTODO 3 - DevTools (Avançado)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-purple-800">
              <li>Pressione <strong>F12</strong> ou <strong>Ctrl+Shift+I</strong></li>
              <li>Vá na aba <strong>"Application"</strong></li>
              <li>Clique em <strong>"Manifest"</strong></li>
              <li>Clique em <strong>"Install"</strong></li>
            </ol>
          </div>
        </div>
      )
    } else if (isSafari) {
      return (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Instruções para Safari
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Clique no botão de <strong>compartilhar (📤)</strong> na barra de ferramentas</li>
            <li>Role para baixo e clique em <strong>"Adicionar à Tela de Início"</strong></li>
            <li>Clique em <strong>"Adicionar"</strong></li>
          </ol>
        </div>
      )
    } else if (isFirefox) {
      return (
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Instruções para Firefox
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
            <li>Clique no <strong>ícone de instalação</strong> na barra de endereços</li>
            <li>Ou vá ao <strong>menu &gt; "Instalar"</strong></li>
            <li>Confirme a instalação</li>
          </ol>
        </div>
      )
    } else {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Instruções Gerais
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-800">
            <li>Procure pelo <strong>ícone de instalação</strong> na barra de endereços</li>
            <li>Ou vá ao <strong>menu do navegador</strong> e procure por "Instalar"</li>
            <li>Confirme a instalação</li>
          </ol>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Smartphone className="h-6 w-6 text-green-600" />
            <span>🚀 Instalar Aplicativo no Computador</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Browser Info */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              {getBrowserIcon()}
              <div>
                <h3 className="font-semibold text-lg">Detectado: {getBrowserName()}</h3>
                <p className="text-sm text-muted-foreground">
                  Instruções específicas para seu navegador
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Como instalar:</h3>
            {getInstructions()}
          </div>

          {/* Result */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Resultado
            </h4>
            <p className="text-sm text-green-800">
              O app será instalado como um <strong>aplicativo nativo</strong> no seu computador, 
              aparecendo na área de trabalho e no menu iniciar!
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
