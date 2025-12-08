'use client'

import { useState } from 'react'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import CategoryBlocks from '@/components/home/CategoryBlocks'
import RecentGallery from '@/components/home/RecentGallery'

export default function Home() {
  const [language, setLanguage] = useState<'pt' | 'en' | 'es' | 'fr' | 'ja'>('pt')

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CategoryBlocks language={language} />
      <RecentGallery language={language} limit={8} />
    </main>
  )
}