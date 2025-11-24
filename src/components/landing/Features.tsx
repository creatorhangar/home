"use client";

import Link from "next/link";

const tools = [
  { icon: "photo_filter", title: "Removedor de Fundo", desc: "Remove fundos de imagem automaticamente com precisão.", href: "/tools/bg-remover" },
  { icon: "code", title: "Conversor SVG", desc: "Converte imagens para o vetor SVG. Perfeito para logos e ícones.", href: "/tools/svg-converter" },
  { icon: "aspect_ratio", title: "Redimensionador de Imagem", desc: "Redimensione e comprima imagens em lote sem perder qualidade.", href: "/tools/image-resizer" },
  { icon: "format_paint", title: "Criador de Texto", desc: "Transforme texto em estilos únicos para mídias sociais.", href: "/tools/text-creator" },
  { icon: "palette", title: "Gerador de Paletas", desc: "Extraia paletas de cores vibrantes de qualquer imagem.", href: "/tools/palette-generator" },
  { icon: "photo_library", title: "Gerador de Mockups", desc: "Crie mockups de produtos e dispositivos com suas imagens.", href: "/tools/mockup-generator" },
];

export function Features() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Mais de 15 ferramentas. Um só lugar.
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            De remoção de fundo precisa a conversão de vetores de alta qualidade, nossas ferramentas offline são construídas para velocidade e privacidade.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group block bg-gray-50 p-8 rounded-2xl hover:bg-primary hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl shadow-lg"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px",
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
              }}
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:text-white group-hover:scale-110 transition-all">
                {tool.icon}
              </span>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-200 text-sm leading-relaxed transition-colors">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#" className="text-primary font-semibold text-lg inline-flex items-center group hover:text-primary/80 transition-colors">
            Ver todas as 15+ ferramentas
            <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
          </a>
        </div>
      </div>
    </section>
  );
}
