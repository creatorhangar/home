'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Imagem } from '@/lib/types'
import { X, Download, RotateCw, Crop, Maximize2 } from 'lucide-react'

interface ImageEditorModalProps {
  image: Imagem
  onClose: () => void
}

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:4'

export default function ImageEditorModal({ image, onClose }: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [rotation, setRotation] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getAspectRatioValue = (ratio: AspectRatio): number | undefined => {
    switch (ratio) {
      case '1:1': return 1
      case '16:9': return 16/9
      case '4:3': return 4/3
      case '3:4': return 3/4
      case 'free': return undefined
      default: return undefined
    }
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = async () => {
    if (!imageRef.current || !completedCrop) return

    setIsProcessing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const image = imageRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Configurar canvas para rotação
      const radians = (rotation * Math.PI) / 180
      const cos = Math.cos(radians)
      const sin = Math.sin(radians)

      // Calcular novas dimensões após rotação
      const newWidth = Math.abs(completedCrop.width * cos) + Math.abs(completedCrop.height * sin)
      const newHeight = Math.abs(completedCrop.width * sin) + Math.abs(completedCrop.height * cos)

      canvas.width = newWidth
      canvas.height = newHeight

      // Aplicar rotação
      ctx.translate(newWidth / 2, newHeight / 2)
      ctx.rotate(radians)
      ctx.translate(-completedCrop.width / 2, -completedCrop.height / 2)

      // Desenhar imagem recortada
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      // Converter para WebP e fazer download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create blob')

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `edited-image-${Date.now()}.webp`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Imagem baixada com sucesso!')
      }, 'image/webp', 0.9)

    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      toast.error('Erro ao processar imagem')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setRotation(0)
    setAspectRatio('free')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Editor de Imagem</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-gray-600" />
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="free">Livre</option>
              <option value="1:1">1:1 Quadrado</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="4:3">4:3 Standard</option>
              <option value="3:4">3:4 Retrato</option>
            </select>
          </div>

          <button
            onClick={handleRotate}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RotateCw className="w-4 h-4" />
            Girar
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <Maximize2 className="w-4 h-4" />
            Resetar
          </button>

          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar
              </>
            )}
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={getAspectRatioValue(aspectRatio)}
              className="max-w-full"
            >
              <img
                ref={imageRef}
                src={image.url_publica}
                alt="Imagem para editar"
                className="max-w-full h-auto"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <p>Formato: WebP (otimizado)</p>
              {completedCrop && (
                <p>Dimensões: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px</p>
              )}
            </div>
            <div>
              <p>Rotação: {rotation}°</p>
              <p>Proporção: {aspectRatio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}