"use client";

import Link from "next/link";

const galleryItems = [
    { title: "Branding para Café", desc: "Logo vetorizado e mockups de copos.", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=750&fit=crop", aspect: "aspect-[4/5]", href: "/tools/svg-converter" },
    { title: "Retrato Criativo", desc: "Fundo removido para uma composição artística.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop", aspect: "aspect-square", href: "/tools/bg-remover" },
    { title: "Posts para Redes Sociais", desc: "Textos estilizados e paletas de cores extraídas.", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop", aspect: "aspect-square", href: "/tools/text-creator" },
    { title: "Fotos de Produto E-commerce", desc: "Imagens redimensionadas e otimizadas em lote.", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=750&fit=crop", aspect: "aspect-[4/5]", href: "/tools/image-resizer" },
    { title: "Mockup de Website", desc: "Apresentação de design de interface em mockups.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=750&fit=crop", aspect: "aspect-[4/5]", href: "/tools/mockup-generator" },
    { title: "Set de Ícones", desc: "Ícones personalizados convertidos para SVG.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop", aspect: "aspect-square", href: "/tools/svg-converter" },
];

export function Gallery() {
    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Galeria de Resultados Impactantes
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                    Veja o que nossos usuários estão criando. De logos vetorizados a mockups de produtos, as possibilidades são infinitas.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="space-y-6 lg:space-y-8">
                    <GalleryCard item={galleryItems[0]} />
                    <GalleryCard item={galleryItems[1]} />
                </div>
                <div className="space-y-6 lg:space-y-8 lg:mt-16">
                    <GalleryCard item={galleryItems[2]} />
                    <GalleryCard item={galleryItems[3]} />
                </div>
                <div className="space-y-6 lg:space-y-8 md:col-span-2 lg:col-span-1">
                    <GalleryCard item={galleryItems[4]} />
                    <GalleryCard item={galleryItems[5]} />
                </div>
            </div>
        </section>
    );
}

function GalleryCard({ item }: { item: typeof galleryItems[0] }) {
    return (
        <Link
            href={item.href}
            className="group relative overflow-hidden rounded-2xl block shadow-lg hover:shadow-2xl transition-shadow duration-300"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
            }}
        >
            <img
                alt={item.title}
                className={`w-full h-auto object-cover ${item.aspect} group-hover:scale-105 transition-transform duration-300`}
                src={item.img}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-white/90">{item.desc}</p>
            </div>
        </Link>
    );
}
