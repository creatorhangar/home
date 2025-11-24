"use client";

import { useState } from "react";

const comparisons = [
    {
        title: "Removedor de Fundo",
        before: "https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800&h=600&fit=crop",
        after: "https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800&h=600&fit=crop&blend=FFFFFF&blend-mode=normal",
    },
    {
        title: "Vetorizador de Imagem",
        before: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&h=600&fit=crop",
        after: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&h=600&fit=crop&sat=-100",
    },
];

export function BeforeAfter() {
    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Transformação em um piscar de olhos
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                    Arraste o slider para ver a magia acontecer. Compare o antes e depois e veja o poder das nossas ferramentas em ação.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {comparisons.map((comp) => (
                    <ComparisonSlider key={comp.title} {...comp} />
                ))}
            </div>
        </section>
    );
}

function ComparisonSlider({ title, before, after }: { title: string; before: string; after: string }) {
    const [value, setValue] = useState(50);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <div className="relative rounded-2xl shadow-2xl overflow-hidden group">
                {/* After image (base layer) */}
                <img
                    alt="Image after"
                    className="w-full h-auto object-cover aspect-video rounded-2xl"
                    src={after}
                />

                {/* Before image (clipped layer) */}
                <div
                    className="absolute inset-0"
                    style={{ clipPath: `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)` }}
                >
                    <img
                        alt="Image before"
                        className="w-full h-full object-cover"
                        src={before}
                    />
                </div>

                {/* Slider divider line with handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-10"
                    style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
                >
                    {/* Handle circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-primary">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>
                </div>

                {/* Range input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0 z-20"
                    aria-label={`Compare before and after ${title.toLowerCase()}`}
                />

                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
                    Antes
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
                    Depois
                </div>
            </div>
        </div>
    );
}
