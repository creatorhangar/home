'use client'

import { useState } from 'react'
import { Search, Crop, RotateCw, Download, Filter, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/galeria?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Seu Portal para
          <span className="text-blue-600"> Recursos Criativos</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Descubra milhares de imagens, texturas e recursos visuais com nosso editor integrado.
          Baixe, edite e crie sem limites.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busque por tags, categorias ou temas..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span className="bg-white px-4 py-2 rounded-full shadow-sm">✨ Wallpapers HD</span>
          <span className="bg-white px-4 py-2 rounded-full shadow-sm">🎨 Texturas Premium</span>
          <span className="bg-white px-4 py-2 rounded-full shadow-sm">📱 PNG Stickers</span>
          <span className="bg-white px-4 py-2 rounded-full shadow-sm">💍 Wedding Elements</span>
        </div>
      </div>
    </section>
  )
}