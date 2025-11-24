"use client";

const testimonials = [
    {
        name: "Sarah Oliveira",
        role: "Designer de Marca",
        rating: 4,
        text: "Trabalho com identidades visuais para empresas e confidencialidade sempre foi prioridade. Usava ferramentas online mas descobri que muitas treinam IA com os arquivos que você faz upload. Ficava pensando nas artes dos meus clientes sendo usadas sem permissão. Aqui processo tudo localmente, nada sai do meu computador. Meus clientes agradecem quando explico isso.",
        highlight: "Privacidade",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
        name: "Michael Santos",
        role: "Criador de Materiais Digitais",
        rating: 5,
        text: "Antes gastava umas 3-4 horas finalizando um ebook porque precisava alternar entre Photoshop pra remover fundos, Illustrator pros vetores e outro programa pra montar. Agora resolvo tudo em menos de uma hora no mesmo lugar. Lancei 3 ebooks só essa semana antes mal conseguia 1 por mês.",
        highlight: "Economia de Tempo",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
        name: "Julia Mendes",
        role: "Vendedora Etsy",
        rating: 4,
        text: "Vendo packs de stickers e sempre precisei processar dezenas de arquivos: remover fundo de cada um, converter pra PNG, SVG, JPG pra web, organizar tudo em PDF. Fazia isso arquivo por arquivo e levava 2 dias. Com a função de lote, seleciono todos, escolho os formatos que preciso e em 20 minutos tenho tudo organizado e pronto. Consegui dobrar meu catálogo em menos de um mês.",
        highlight: "Criação em Lote",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
];

export function Testimonials() {
    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        O que nossos criadores dizem
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Histórias reais de quem usa o Creative Hangar todos os dias
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="glass-card glass-card-hover rounded-2xl p-8 border border-primary/10"
                        >
                            {/* Highlight Badge */}
                            <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
                                {testimonial.highlight}
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        ⭐
                                    </span>
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-700 leading-relaxed mb-6 italic text-sm">
                                "{testimonial.text}"
                            </p>

                            {/* Author - Now at bottom with photo */}
                            <div className="border-t border-gray-200 pt-4 flex items-center gap-3">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Line */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600">
                        Junte-se a <span className="font-bold text-primary">centenas de criadores</span> que já transformaram seu fluxo de trabalho
                    </p>
                </div>
            </div>
        </section>
    );
}
