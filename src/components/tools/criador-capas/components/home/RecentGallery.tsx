'use client'

import { useImages } from '@/hooks/useImages'
import { useConcepts } from '@/hooks/useConcepts'
import { Imagem, LanguageCode } from '@/lib/types'
import { formatImageUrl } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

interface RecentGalleryProps {
  language: LanguageCode
  limit?: number
}

function ImageCard({ image, language, onClick }: { image: Imagem; language: LanguageCode; onClick: () => void }) {
  const { getCategoriaNome } = useConcepts(language)
  const [isHovered, setIsHovered] = useState(false)
  
  const categoriaNome = getCategoriaNome(image.categoria_id)
  const isWallpaperOrTexture = categoriaNome.toLowerCase().includes('wallpaper') || categoriaNome.toLowerCase().includes('textura')

  return (
    <div
      className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
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
          style={{
            backgroundColor: image.cor_dominante || '#f3f4f6'
          }}
        />
        
        {/* Badge de destacado */}
        {image.destacado && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Destaque
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-800">{categoriaNome}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(image.created_at).toLocaleDateString(language)}
        </p>
      </div>
    </div>
  )
}

export default function RecentGallery({ language, limit = 12 }: RecentGalleryProps) {
  const { images, loading, error, hasMore, loadMore } = useImages(language)
  const { getCategoriaNome } = useConcepts(language)
  const router = useRouter()

  const handleImageClick = (image: Imagem) => {
    const categoriaNome = getCategoriaNome(image.categoria_id)
    router.push(`/galeria?categoria=${encodeURIComponent(categoriaNome)}`)
  }

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

  const displayImages = limit ? images.slice(0, limit) : images

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Galeria Mais Recente
          </h2>
          <p className="text-xl text-gray-600">
            Descubra as últimas adições à nossa coleção
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {displayImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              language={language}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>

        {limit && images.length > limit && (
          <div className="text-center">
            <button
              onClick={() => router.push('/galeria')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todas as imagens
            </button>
          </div>
        )}
      </div>
    </section>
  )
}