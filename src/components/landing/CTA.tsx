"use client";

import { useState, useEffect } from "react";

const tools = [
    {
        name: "Removedor de Fundo",
        desc: "Remova fundos de milhares de imagens instantaneamente",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
    },
    {
        name: "Conversor SVG",
        desc: "Transforme imagens em vetores escaláveis",
        image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=600&fit=crop",
    },
    {
        name: "Redimensionador",
        desc: "Redimensione em lote sem perder qualidade",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=600&fit=crop",
    },
];

export function CTA() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % tools.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentTool = tools[currentIndex];

    return (
        <section className="py-16 sm:py-24">
            <div className="bg-primary text-white rounded-3xl p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden min-h-[400px] sm:min-h-[500px] flex items-center justify-center">
                {/* Background image with overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                    style={{
                        backgroundImage: `url(${currentTool.image})`,
                        filter: "brightness(0.25) blur(10px)",
                    }}
                />

                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                        Pronto para {currentTool.name}?
                    </h2>
                    <p className="text-lg sm:text-xl opacity-90 mb-10 leading-relaxed">
                        {currentTool.desc}. Junte-se a milhares de profissionais que confiam em nossas ferramentas.
                    </p>
                    <button className="bg-white text-primary px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-2xl">
                        Comece de graça hoje
                    </button>
                    <p className="mt-6 text-sm opacity-70">Não é necessário cartão de crédito.</p>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-3 mt-10">
                        {tools.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white w-10" : "bg-white/40 w-2 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to tool ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
