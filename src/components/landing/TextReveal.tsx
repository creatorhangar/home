"use client";

import { motion } from "framer-motion";

const tools = [
    "Removedor em Lote",
    "Vetorizador SVG",
    "Otimizador de Fotos",
    "Caça-Palavras",
    "Criador de Planners",
    "Galeria de Texturas",
];

export function TextReveal() {
    return (
        <div className="max-w-5xl mx-auto px-8 text-center">
            {/* Main Title */}
            <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="font-display text-7xl md:text-8xl lg:text-9xl font-bold mb-6 text-gray-900"
            >
                Creator Hangar
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
                Ferramentas criativas. Processamento local. Total privacidade.
            </motion.p>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {tools.map((tool, i) => (
                    <motion.div
                        key={tool}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.4 + i * 0.1,
                            ease: "easeOut"
                        }}
                        className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        <p className="font-display text-lg md:text-xl font-medium text-gray-800">
                            {tool}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                className="mt-12"
            >
                <button className="bg-[#6B5B95] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#6B5B95]/90 hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#6B5B95]/30">
                    Começar Grátis
                </button>
            </motion.div>
        </div>
    );
}
