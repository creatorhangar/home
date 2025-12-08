'use client'

import { useState } from 'react'
import { useImages } from '@/hooks/useImages'
import { useConcepts } from '@/hooks/useConcepts'
import { Imagem, LanguageCode } from '@/lib/types'
import { formatImageUrl } from '@/lib/utils'
import { Download, Edit, Search } from 'lucide-react'
import ImageEditorModal from '@/components/editor/ImageEditorModal'

interface ImageCardProps {
  image: Imagem
  language: LanguageCode
  onEdit: (image: Imagem) => void
}

function ImageCard({ image, language, onEdit }: ImageCardProps) {
  const { getCategoriaNome } = useConcepts(language)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const categoriaNome = getCategoriaNome(image.categoria_id)
  const isWallpaperOrTexture = categoriaNome.toLowerCase().includes('wallpaper') || categoriaNome.toLowerCase().includes('textura')

  return (
    <div
      className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem com efeito de hover */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={formatImageUrl(image.url_publica, 400)}
          alt={`Imagem ${categoriaNome}`}
          className={`w-full h-full transition-all duration-300 ${
            isWallpaperOrTexture
              ? isHovered
                ? 'image-contain blur-background'
                : 'image-cover'
              : 'image-contain'
          }`}
          onLoad={() => setImageLoaded(true)}
          style={{
            backgroundColor: image.cor_dominante || '#f3f4f6'
          }}
        />
        
        {/* Overlay de hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center`}>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(image.url_publica, '_blank')
              }}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(image)
              }}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Badge de destacado */}
        {image.destacado && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Destaque
          </div>
        )}
      </div>

      {/* Informações da imagem */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800">{categoriaNome}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(image.created_at).toLocaleDateString(language)}
        </p>
      </div>
    </div>
  )
}

interface GalleryGridProps {
  language: LanguageCode
  searchParams?: {
    tag?: string
    categoria?: string
  }
}

export default function GalleryGrid({ language, searchParams }: GalleryGridProps) {
  const { images, loading, error, hasMore, loadMore } = useImages(language, {
    tag_busca: searchParams?.tag,
    categoria_busca: searchParams?.categoria
  })
  const [selectedImage, setSelectedImage] = useState<Imagem | null>(null)

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">Nenhuma imagem encontrada</p>
        <p className="text-gray-500 text-sm">
          {searchParams?.tag && `Tente ajustar sua busca por "${searchParams.tag}"`}
          {searchParams?.categoria && `Tente ajustar sua busca por "${searchParams.categoria}"`}
          {!searchParams?.tag && !searchParams?.categoria && 'Volte mais tarde para ver novas imagens'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Grid de imagens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            language={language}
            onEdit={setSelectedImage}
          />
        ))}
      </div>

      {/* Botão de carregar mais */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Carregando...
              </>
            ) : (
              'Carregar mais imagens'
            )}
          </button>
        </div>
      )}

      {/* Modal de editor */}
      {selectedImage && (
        <ImageEditorModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}