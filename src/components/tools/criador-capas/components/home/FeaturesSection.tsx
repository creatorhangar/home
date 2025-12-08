'use client'

import { Crop, RotateCw, Download, Filter, Sparkles } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Crop className="w-8 h-8 text-blue-600" />,
      title: 'Redimensionador Flexível',
      description: 'Corte perfeito com proporções pré-definidas: 16:9, 4:5, 1:1 e modo livre para total liberdade criativa.'
    },
    {
      icon: <RotateCw className="w-8 h-8 text-blue-600" />,
      title: 'Editor Rápido',
      description: 'Gire suas imagens em 90° com um clique e ajuste a orientação perfeita para seus projetos.'
    },
    {
      icon: <Download className="w-8 h-8 text-blue-600" />,
      title: 'Downloads Instantâneos',
      description: 'Todo o processamento acontece no seu navegador. Sem uploads, sem espera, total privacidade.'
    },
    {
      icon: <Filter className="w-8 h-8 text-blue-600" />,
      title: 'Filtros Populares',
      description: 'Encontre exatamente o que precisa com nossos filtros inteligentes por categoria, cor e estilo.'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Recursos Únicos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme suas imagens com ferramentas profissionais direto no navegador
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}