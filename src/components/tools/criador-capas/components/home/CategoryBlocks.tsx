'use client'

import { useRouter } from 'next/navigation'
import { useConcepts } from '@/hooks/useConcepts'
import { Categoria, Tag } from '@/lib/types'

interface CategoryBlocksProps {
  language: 'pt' | 'en' | 'es' | 'fr' | 'ja'
}

export default function CategoryBlocks({ language }: CategoryBlocksProps) {
  const router = useRouter()
  const { categorias, categoriaTraducoes, tags, tagTraducoes, getCategoriaNome } = useConcepts(language)

  const handleCategoryClick = (categoria: Categoria) => {
    const categoriaNome = getCategoriaNome(categoria.id)
    router.push(`/galeria?categoria=${encodeURIComponent(categoriaNome)}`)
  }

  const handleTagClick = (tag: Tag) => {
    const tagTraducao = tagTraducoes.find(tt => tt.tag_id === tag.id)
    if (tagTraducao) {
      router.push(`/galeria?tag=${encodeURIComponent(tagTraducao.nome_traduzido)}`)
    }
  }

  // Categorias principais para destaque
  const categoriasPrincipais = categorias.slice(0, 4)
  const tagsPrincipais = tags.slice(0, 4)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore por Categorias
          </h2>
          <p className="text-xl text-gray-600">
            Encontre o que precisa navegando por nossas categorias e tags
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categoriasPrincipais.map((categoria) => {
            const categoriaNome = getCategoriaNome(categoria.id)
            return (
              <div
                key={categoria.id}
                onClick={() => handleCategoryClick(categoria)}
                className="bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">
                    {categoria.identificador_unico.includes('wallpaper') && '🖼️'}
                    {categoria.identificador_unico.includes('texture') && '🎨'}
                    {categoria.identificador_unico.includes('png') && '📱'}
                    {categoria.identificador_unico.includes('junk') && '📓'}
                    {categoria.identificador_unico.includes('wedding') && '💍'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {categoriaNome}
                </h3>
                <p className="text-gray-600 text-sm">
                  Explore nossa coleção de {categoriaNome.toLowerCase()}
                </p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Tags Populares
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {tagsPrincipais.map((tag) => {
              const tagTraducao = tagTraducoes.find(tt => tt.tag_id === tag.id)
              if (!tagTraducao) return null
              
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2 bg-white rounded-full text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 shadow-sm"
                >
                  {tagTraducao.nome_traduzido}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}