export function Workflow() {
    const steps = [
        { num: 1, title: "Remoção de Fundo em Lote", desc: "Importe todas as fotos do produto e remova o fundo de todas com um único clique." },
        { num: 2, title: "Criação do Mockup", desc: "Use o Gerador de Mockups para aplicar o produto a um cenário de estúdio." },
        { num: 3, title: "Adição de Texto e Exportação", desc: "Adicione um texto promocional com o Criador de Texto e exporte a imagem final." },
    ];

    const images = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&blend=FFFFFF&blend-mode=normal",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&sat=-50",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&sat=-50&blend=000000&blend-alpha=10",
    ];

    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Workflow Otimizado: de Foto a Post
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-8">
                            Veja como as ferramentas se integram para criar um post de e-commerce em minutos. Um fluxo de trabalho rápido, eficiente e 100% privado.
                        </p>

                        <div className="space-y-6">
                            {steps.map((step, idx) => (
                                <div key={step.num} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex-shrink-0 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                                            {step.num}
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className="w-px h-16 bg-gray-300"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">{step.title}</h3>
                                        <p className="mt-1 text-gray-600 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    alt={`Product transformation step ${idx + 1}`}
                                    className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-300"
                                    src={img}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
