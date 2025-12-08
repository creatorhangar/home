'use client'

import { useSearchParams } from 'next/navigation'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export default function GalleryPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const tag = searchParams.get('tag')
  const categoria = searchParams.get('categoria')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {search && `Resultados para: "${search}"`}
            {tag && `Tag: "${tag}"`}
            {categoria && `Categoria: "${categoria}"`}
            {!search && !tag && !categoria && 'Todas as Imagens'}
          </h1>
          <p className="text-gray-600">
            Explore nossa coleção de recursos visuais criativos
          </p>
        </div>

        <GalleryGrid 
          language="pt" 
          searchParams={{
            tag: tag || undefined,
            categoria: categoria || undefined
          }}
        />
      </div>
    </div>
  )
}