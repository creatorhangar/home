"use client";

import { TOOLS } from "@/config/tools";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ToolsListProps {
    onHoverColor: (color: string | null) => void;
}

export function ToolsList({ onHoverColor }: ToolsListProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const currentToolIndex = activeIndex % TOOLS.length;
    const currentTool = TOOLS[currentToolIndex];

    useEffect(() => {
        onHoverColor(currentTool.color);
    }, [currentToolIndex, onHoverColor]);

    const visibleRange = [-2, -1, 0, 1, 2];

    return (
        <div className="flex flex-col items-start gap-4 w-full relative h-[400px] justify-center overflow-hidden">
            {/* Gradientes mais suaves */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

            <div className="relative w-full flex flex-col items-start pl-8"> {/* Adicionado padding left */}
                {visibleRange.map((offset) => {
                    const virtualIndex = activeIndex + offset;
                    const realIndex = ((virtualIndex % TOOLS.length) + TOOLS.length) % TOOLS.length;
                    const tool = TOOLS[realIndex];
                    const isActive = offset === 0;

                    return (
                        <div
                            key={virtualIndex}
                            className="w-full flex items-center h-[70px] transition-all duration-700 ease-in-out" // Transição mais lenta e suave
                            style={{
                                opacity: isActive ? 1 : 0.2, // Menos opacidade nos inativos
                                transform: `translateX(${isActive ? '0px' : '0px'})`, // Removido movimento lateral agressivo
                            }}
                        >
                            <Link
                                href={tool.path}
                                className="w-full"
                                onMouseEnter={() => setActiveIndex(virtualIndex)}
                            >
                                <h3
                                    className="font-display tracking-tight cursor-pointer whitespace-nowrap transition-all duration-700"
                                    style={{
                                        fontSize: isActive ? '3.5rem' : '1.8rem', // Diferença de tamanho reduzida
                                        color: '#ffffff',
                                        fontWeight: isActive ? 500 : 300,
                                        // Glow MUITO reduzido e elegante
                                        textShadow: isActive
                                            ? `0 0 20px ${tool.color}40` // 40 = 25% opacity
                                            : 'none',
                                    }}
                                >
                                    {tool.name}
                                </h3>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Indicadores Minimalistas */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
                {TOOLS.map((tool, index) => (
                    <div
                        key={index}
                        className="w-1 rounded-full transition-all duration-500"
                        style={{
                            height: index === currentToolIndex ? 16 : 4,
                            backgroundColor: index === currentToolIndex ? tool.color : '#ffffff10',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
