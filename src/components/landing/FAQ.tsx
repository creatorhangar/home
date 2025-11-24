"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "Como funciona a cobrança?",
        a: "Cobramos mensalmente ou anualmente via cartão de crédito através do Stripe. Você pode cancelar a qualquer momento e não há taxas de cancelamento."
    },
    {
        q: "Posso cancelar a qualquer momento?",
        a: "Sim! Você pode cancelar sua assinatura a qualquer momento diretamente no painel. Não fazemos perguntas e não há multas ou taxas de cancelamento."
    },
    {
        q: "Meus dados estão seguros?",
        a: "Absolutamente. Todo o processamento acontece localmente no seu computador. Seus arquivos nunca são enviados para nossos servidores ou para a nuvem. Nós nunca vemos seus dados."
    },
    {
        q: "Qual a diferença entre os planos?",
        a: "O plano Grátis oferece acesso a 3 ferramentas com limite de 5 edições por dia. O plano Pro desbloqueia todas as 15+ ferramentas, edições ilimitadas em lote, suporte prioritário e exportação em alta resolução."
    },
    {
        q: "Preciso de internet para usar?",
        a: "Não! Após fazer login inicial, todas as ferramentas funcionam 100% offline. O processamento é local, então você pode trabalhar sem conexão com a internet."
    },
    {
        q: "Há limite de uso no plano Pro?",
        a: "Não há limites! Com o plano Pro você pode processar quantas imagens quiser, fazer edições em lote ilimitadas e usar todas as ferramentas sem restrições."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Tudo que você precisa saber sobre o Creative Hangar
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="glass-card rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 ease-out"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-primary/5 transition-all duration-300 ease-out"
                            >
                                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ease-out ${openIndex === idx ? 'rotate-180' : ''}`} />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-out ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
