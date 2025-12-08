'use client'

import { useState } from 'react'
import ImageUploader from '@/components/admin/ImageUploader'

export default function UploadPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en' | 'es' | 'fr' | 'ja'>('pt')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload de Imagens
          </h1>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Idioma:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <ImageUploader language={selectedLanguage} />
      </div>
    </div>
  )
}