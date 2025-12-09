"use client";

import { Crown } from "lucide-react";

export default function CriadorCapasPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-orange-500/20">
                🎨
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criador de Capas</h1>
            <p className="text-gray-500 max-w-md mb-8">
                Esta ferramenta está sendo atualizada para incluir novos modelos e recursos exclusivos.
                Volte em breve!
            </p>

            <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Recurso Premium
            </div>
        </div>
    );
}
