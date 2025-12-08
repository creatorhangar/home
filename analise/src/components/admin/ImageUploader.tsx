'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useConcepts } from '@/hooks/useConcepts'
import { useImages } from '@/hooks/useImages'
import { Upload, X, Check, Star, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { detectDominantColor } from '@/lib/color-utils'
import { Categoria, Tag, LanguageCode } from '@/lib/types'

interface ImageUploaderProps {
  language: LanguageCode
}

interface UploadedFile extends File {
  preview: string
  id: string
}

interface ProcessingImage {
  id: string
  file: UploadedFile
  categoriaId: string
  tagIds: string[]
  destacado: boolean
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

export default function ImageUploader({ language }: ImageUploaderProps) {
  const { categorias, categoriaTraducoes, tags, tagTraducoes, getCategoriaNome } = useConcepts(language)
  const { createImage } = useImages(language)
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>([])
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [marcarDestacado, setMarcarDestacado] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      } as UploadedFile)
    )
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
    setProcessingImages(prev => prev.filter(img => img.id !== id))
  }

  const processImages = async () => {
    if (!selectedCategoria) {
      toast.error('Por favor, selecione uma categoria')
      return
    }

    if (files.length === 0) {
      toast.error('Por favor, adicione imagens para processar')
      return
    }

    setIsProcessing(true)
    const processingQueue: ProcessingImage[] = files.map(file => ({
      id: file.id,
      file,
      categoriaId: selectedCategoria,
      tagIds: selectedTags,
      destacado: marcarDestacado,
      status: 'pending',
      progress: 0
    }))

    setProcessingImages(processingQueue)

    // Processar imagens em lote
    for (let i = 0; i < processingQueue.length; i++) {
      const image = processingQueue[i]
      
      try {
        // Atualizar status
        setProcessingImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'uploading', progress: 25 } : img
        ))

        // Upload para Supabase Storage
        const fileName = `${Date.now()}-${image.file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('galeria-uploads')
          .upload(fileName, image.file)

        if (uploadError) throw uploadError

        // Atualizar progresso
        setProcessingImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, progress: 50 } : img
        ))

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('galeria-uploads')
          .getPublicUrl(fileName)

        // Detectar cor dominante
      const corDominante = await detectDominantColor(image.file)

        // Atualizar progresso
        setProcessingImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, progress: 75 } : img
        ))

        // Criar registro no banco de dados
        await createImage({
          categoria_id: image.categoriaId,
          destacado: image.destacado,
          url_publica: publicUrl,
          cor_dominante: corDominante,
          tag_ids: image.tagIds
        })

        // Finalizar
        setProcessingImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'completed', progress: 100 } : img
        ))

      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        setProcessingImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'error', 
            progress: 0, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          } : img
        ))
      }
    }

    setIsProcessing(false)
    toast.success('Processamento concluído!')
    
    // Limpar arquivos processados com sucesso
    setTimeout(() => {
      setFiles(prev => prev.filter(file => 
        !processingQueue.some(img => img.id === file.id && img.status === 'completed')
      ))
      setProcessingImages(prev => prev.filter(img => img.status !== 'completed'))
    }, 3000)
  }

  const detectDominantColor = async (file: File): Promise<string> => {
    // Implementação simplificada - em produção, usar color-thief-react
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        // Cor padrão para demonstração
        resolve('#3b82f6')
      }
      img.onerror = () => resolve('#6b7280')
      img.src = URL.createObjectURL(file)
    })
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Configurações de upload */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configurações do Upload</h3>
        
        {/* Categoria */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {getCategoriaNome(categoria.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tagTraducoes.map(traducao => (
              <button
                key={traducao.tag_id}
                onClick={() => toggleTag(traducao.tag_id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(traducao.tag_id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {traducao.nome_traduzido}
              </button>
            ))}
          </div>
        </div>

        {/* Opções */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={marcarDestacado}
              onChange={(e) => setMarcarDestacado(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Marcar como destacado</span>
          </label>
        </div>

        {/* Botão de processar */}
        <button
          onClick={processImages}
          disabled={isProcessing || files.length === 0 || !selectedCategoria}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Processar {files.length} imagem(s)
            </>
          )}
        </button>
      </div>

      {/* Dropzone */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Upload de Imagens</h3>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Solte as imagens aqui...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Arraste e solte imagens aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceitos: JPEG, PNG, WebP, GIF (máx. 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview das imagens */}
      {(files.length > 0 || processingImages.length > 0) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Imagens ({files.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => {
              const processingImage = processingImages.find(img => img.id === file.id)
              
              return (
                <div key={file.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Status do processamento */}
                  {processingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        {processingImage.status === 'uploading' && (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-xs">Upload...</p>
                          </>
                        )}
                        {processingImage.status === 'processing' && (
                          <>
                            <div className="animate-pulse h-6 w-6 bg-white mx-auto mb-2"></div>
                            <p className="text-xs">Processando...</p>
                          </>
                        )}
                        {processingImage.status === 'completed' && (
                          <>
                            <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <p className="text-xs">Concluído!</p>
                          </>
                        )}
                        {processingImage.status === 'error' && (
                          <>
                            <X className="w-6 h-6 text-red-400 mx-auto mb-2" />
                            <p className="text-xs text-red-400">Erro</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Botão de remover */}
                  {!processingImage && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Barra de progresso */}
                  {processingImage && processingImage.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div 
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${processingImage.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}