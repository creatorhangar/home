"use client";

import { useState, useEffect } from "react";
import { BookOpen, Palette, Mail, Gamepad2, Sparkles, Lightbulb } from "lucide-react";

const productTypes = [
    { name: "ebooks personalizados", avgPrice: 27, icon: BookOpen },
    { name: "packs de stickers PNG/SVG", avgPrice: 19, icon: Palette },
    { name: "convites de casamento", avgPrice: 45, icon: Mail },
    { name: "jogos/atividades infantis", avgPrice: 35, icon: Gamepad2 },
];

export function RevenueCalculator() {
    const [products, setProducts] = useState(50);
    const [animatedRevenue, setAnimatedRevenue] = useState(0);
    const [animatedProfit, setAnimatedProfit] = useState(0);

    // Calculate revenue
    const distribution = [0.4, 0.3, 0.2, 0.1];
    const breakdown = productTypes.map((product, idx) => ({
        ...product,
        quantity: Math.floor(products * distribution[idx]),
        revenue: Math.floor(products * distribution[idx]) * product.avgPrice,
    }));

    const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0);
    const planCost = 49;
    const netProfit = totalRevenue - planCost;
    const avgPrice = Math.floor(totalRevenue / products);
    const paybackProducts = Math.ceil(planCost / avgPrice);

    // Counter animation - SMOOTH
    useEffect(() => {
        const duration = 600; // Increased for smoother animation
        const steps = 30; // More steps = smoother
        const revenueStep = (totalRevenue - animatedRevenue) / steps;
        const profitStep = (netProfit - animatedProfit) / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setAnimatedRevenue(totalRevenue);
                setAnimatedProfit(netProfit);
                clearInterval(timer);
            } else {
                setAnimatedRevenue(prev => Math.floor(prev + revenueStep));
                setAnimatedProfit(prev => Math.floor(prev + profitStep));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [totalRevenue, netProfit]);

    // Dynamic CTA - BETTER COPY
    const getCTA = () => {
        if (products <= 30) return "Começar a faturar agora";
        if (products <= 100) return `Quero faturar R$ ${netProfit.toLocaleString()}/mês`;
        return "Transformar em renda principal";
    };

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                        Calcule seu Potencial de Ganhos
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        Veja quanto você pode faturar vendendo produtos digitais
                    </p>
                </div>

                {/* Slider - FIXED NUMBER SYNC */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <label className="font-semibold text-gray-900">
                            Quantos produtos você vende por mês?
                        </label>
                        <span className="text-2xl font-bold text-primary">{products}</span>
                    </div>

                    <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={products}
                        onChange={(e) => setProducts(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-primary"
                    />

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>10</span>
                        <span>125</span>
                        <span>250</span>
                        <span>375</span>
                        <span>500+</span>
                    </div>
                </div>

                {/* Revenue Card - SMOOTH ANIMATIONS */}
                <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 ease-out">
                    {/* Context */}
                    <p className="text-gray-600 text-center mb-4">
                        Com <span className="font-bold text-primary">{products} vendas/mês</span>, você pode faturar:
                    </p>

                    {/* Hero Number */}
                    <div className="text-center mb-6">
                        <p className="text-4xl lg:text-5xl font-display font-bold text-primary mb-1 transition-all duration-500 ease-out">
                            R$ {animatedRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                            (média de R$ {avgPrice} por produto)
                        </p>
                    </div>

                    {/* Product Mix - BETTER COPY */}
                    <div className="space-y-2 mb-5">
                        <p className="font-semibold text-gray-900 mb-3 text-sm">Seu mix de produtos:</p>
                        {breakdown.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-primary/5 transition-all duration-300 ease-out text-sm">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-primary" />
                                        <span className="text-gray-700">
                                            {item.quantity} {item.name}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-gray-900">R$ {item.revenue.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Profit Calculation - NO ROI */}
                    <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-gray-700 text-sm">
                            <span>Faturamento</span>
                            <span className="font-semibold">R$ {animatedRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-700 text-sm">
                            <span>Plano Pro</span>
                            <span className="font-semibold">- R$ 49</span>
                        </div>
                        <div className="border-t-2 border-primary/30 pt-3 flex justify-between items-center">
                            <span className="font-bold text-lg">LUCRO LÍQUIDO</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-display font-bold text-green-600 transition-all duration-500 ease-out">
                                    R$ {animatedProfit.toLocaleString()}
                                </span>
                                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 mt-3">
                            <p className="text-xs text-gray-700 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                <span>Pague o plano em apenas {paybackProducts} vendas</span>
                            </p>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-gray-50 rounded-xl p-4 my-5 border-l-4 border-primary">
                        <p className="text-xs text-gray-700 italic">
                            "Mais de 500 criadores já faturam acima de R$ 1.000/mês com nossas ferramentas"
                        </p>
                    </div>

                    {/* Dynamic CTA - BETTER COPY */}
                    <button className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-primary/90 hover:scale-[1.02] transition-all duration-300 ease-out shadow-lg hover:shadow-xl">
                        {getCTA()}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        7 dias grátis • Cancele quando quiser
                    </p>
                </div>
            </div>
        </section>
    );
}
