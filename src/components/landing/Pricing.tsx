'use client';

import { useState } from 'react';
import { CheckCircle } from "lucide-react";
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    const handleCheckout = async (planType: 'pro' | 'enterprise') => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        setLoading(planType);

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    period: isAnnual ? 'annual' : 'monthly',
                    planType,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data);
                alert('Erro ao iniciar checkout. Tente novamente.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Erro ao processar. Tente novamente.');
        } finally {
            setLoading(null);
        }
    };

    const monthlyPrice = 49;
    const annualPrice = 39; // desconto de ~20%
    const currentPrice = isAnnual ? annualPrice : monthlyPrice;

    const plans = [
        {
            id: 'free',
            name: "Grátis",
            desc: "Para uso casual e testes",
            price: "R$0",
            period: "/mês",
            features: [
                "Acesso a 3 ferramentas",
                "Até 5 edições por dia",
                "Processamento local",
            ],
            cta: "Comece agora",
            variant: "outline" as const,
        },
        {
            id: 'pro',
            name: "Pro",
            desc: "Para profissionais e equipes",
            price: `R$${currentPrice}`,
            period: "/mês",
            annualNote: isAnnual ? "Cobrado R$468/ano" : null,
            features: [
                "Acesso a todas as 15+ ferramentas",
                "Edições em lote ilimitadas",
                "Suporte prioritário",
                "Exportação em alta resolução",
            ],
            cta: loading === 'pro' ? "Carregando..." : "Escolher plano Pro",
            variant: "primary" as const,
            popular: true,
        },
    ];

    return (
        <section id="pricing" className="py-16 sm:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Planos flexíveis para todos
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                    Escolha o plano que se adapta às suas necessidades. Cancele a qualquer momento.
                </p>
            </div>

            {/* Toggle Mensal/Anual */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-lg font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                    Mensal
                </span>
                <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`relative w-16 h-8 rounded-full transition-colors ${isAnnual ? 'bg-primary' : 'bg-gray-300'}`}
                >
                    <span
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`}
                    />
                </button>
                <span className={`text-lg font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                    Anual
                </span>
                {isAnnual && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        Economize 20%
                    </span>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`${plan.variant === "primary"
                            ? "bg-primary text-white shadow-2xl shadow-primary/40 relative border-4 border-primary ring-4 ring-primary/20"
                            : "bg-white border-2 border-gray-200 hover:border-primary/30"
                            } p-8 lg:p-10 rounded-3xl flex flex-col h-full transition-all duration-500 ease-out hover:shadow-xl`}
                    >
                        {plan.popular && (
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary px-8 py-2.5 rounded-full text-sm font-bold shadow-xl">
                                ⭐ Mais Popular
                            </span>
                        )}

                        <div className="mb-6">
                            <h3 className={`text-2xl font-bold mb-2 ${plan.variant === "primary" ? "text-white" : "text-gray-900"}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm ${plan.variant === "primary" ? "text-white/80" : "text-gray-600"}`}>
                                {plan.desc}
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold font-display ${plan.variant === "primary" ? "text-white" : "text-gray-900"}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-lg ${plan.variant === "primary" ? "text-white/70" : "text-gray-600"}`}>
                                    {plan.period}
                                </span>
                            </div>
                            {plan.annualNote && (
                                <p className="text-white/60 text-sm mt-1">{plan.annualNote}</p>
                            )}
                        </div>

                        <ul className={`space-y-4 mb-8 flex-grow ${plan.variant === "primary" ? "text-white/90" : "text-gray-700"}`}>
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.variant === "primary" ? "text-yellow-400" : "text-green-500"}`} />
                                    <span className="text-sm leading-relaxed">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => {
                                if (plan.id === 'free') {
                                    router.push(user ? '/dashboard' : '/signup');
                                } else if (plan.id === 'pro') {
                                    handleCheckout('pro');
                                }
                            }}
                            disabled={loading === plan.id}
                            className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ease-out disabled:opacity-50 ${plan.variant === "primary"
                                ? "bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                                }`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
