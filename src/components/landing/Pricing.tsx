import { CheckCircle } from "lucide-react";

export function Pricing() {
    const plans = [
        {
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
            name: "Pro",
            desc: "Para profissionais e equipes",
            price: "R$49",
            period: "/mês",
            features: [
                "Acesso a todas as 15+ ferramentas",
                "Edições em lote ilimitadas",
                "Suporte prioritário",
                "Exportação em alta resolução",
            ],
            cta: "Escolher plano Pro",
            variant: "primary" as const,
            popular: true,
        },
        {
            name: "Empresarial",
            desc: "Para grandes organizações",
            price: "Contato",
            period: "",
            features: [
                "Recursos do plano Pro",
                "Integrações personalizadas",
                "Gerente de conta dedicado",
                "Faturamento centralizado",
            ],
            cta: "Fale conosco",
            variant: "outline" as const,
        },
    ];

    return (
        <section id="pricing" className="py-16 sm:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Planos flexíveis para todos
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                    Escolha o plano que se adapta às suas necessidades. Cancele a qualquer momento.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`${plan.variant === "primary"
                            ? "bg-primary text-white shadow-2xl shadow-primary/40 relative lg:scale-110 border-4 border-primary ring-4 ring-primary/20"
                            : "bg-white border-2 border-gray-200 hover:border-primary/30"
                            } p-8 lg:p-10 rounded-3xl flex flex-col h-full transition-all duration-500 ease-out hover:shadow-xl`}
                    >
                        {plan.popular && (
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary px-8 py-2.5 rounded-full text-sm font-bold shadow-xl animate-pulse">
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
                            className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ease-out ${plan.variant === "primary"
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
