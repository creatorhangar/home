import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle } from "lucide-react";

export function Hero() {
    return (
        <section className="py-20 sm:py-28 lg:py-36">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content */}
                <div className="text-center lg:text-left">
                    <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-4 py-2 rounded-full mb-6">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Seus dados pertencem a você. Processamento 100% Local.
                    </span>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                        O hub de ferramentas completo para suas criações.
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Edite imagens em lote, remova fundos, vetorize logos e redimensione milhares de fotos com total privacidade. Sem uploads. Sem limites.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto bg-primary text-white px-10 py-5 text-lg rounded-xl font-bold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/30 hover:shadow-primary/40">
                            Começar de graça
                        </Button>
                        <a href="#how-it-works" className="group inline-flex items-center text-primary font-semibold text-lg hover:text-primary/80 transition-colors">
                            Como funciona
                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Trust Line */}
                    <p className="mt-8 text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Sem cartão de crédito • Cancele quando quiser</span>
                    </p>
                </div>

                {/* Images */}
                <div className="relative h-[400px] lg:h-[500px]">
                    <img
                        alt="Abstract design showing a creative process"
                        className="absolute top-0 left-0 w-2/3 h-2/3 rounded-3xl object-cover shadow-2xl transform -rotate-12 hover:scale-105 hover:-rotate-6 transition-all duration-500"
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop"
                        loading="lazy"
                    />
                    <img
                        alt="A different abstract design element"
                        className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-3xl object-cover shadow-2xl transform rotate-6 border-4 border-white hover:scale-105 hover:rotate-3 transition-all duration-500"
                        src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}
