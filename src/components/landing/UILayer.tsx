"use client";

import React, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";

export function UILayer() {
    const [loaded, setLoaded] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const creatorRef = useRef<HTMLSpanElement>(null);
    const hangarRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        setLoaded(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-row items-center justify-between px-12 md:px-24">
            {/* 40% Width Text Container */}
            <div className="w-[40%] flex flex-col justify-center h-full pointer-events-auto z-10">

                {/* Header/Logo Area - Enhanced */}
                <div
                    className={clsx(
                        "transition-all duration-1000 transform ease-out mb-12",
                        loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    )}
                >
                    <h1 className="text-8xl md:text-[10rem] font-serif text-white leading-[0.9] mb-8">
                        {/* "Creator" - Mouse tracking to the right */}
                        <span
                            ref={creatorRef}
                            className="block transition-transform duration-300 ease-out"
                            style={{
                                transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 5}px)`,
                                textShadow: '0 0 40px rgba(165, 180, 252, 0.3)'
                            }}
                        >
                            Creator
                        </span>

                        {/* "Hangar" - Mouse tracking to bottom-left */}
                        <span
                            ref={hangarRef}
                            className="block italic font-light text-indigo-100 transition-transform duration-300 ease-out"
                            style={{
                                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * 15}px)`,
                                textShadow: '0 0 30px rgba(147, 155, 252, 0.4)'
                            }}
                        >
                            Hangar
                        </span>
                    </h1>

                    <p className="text-[#E0E0E0] text-lg md:text-xl max-w-md font-light leading-[1.6]">
                        Ferramentas de precisão para criadores digitais.
                        Otimize, vetorize e crie em um ambiente de gravidade zero.
                    </p>
                </div>

                {/* Navigation / List */}
                <nav className="space-y-6">
                    {["Vetorizador SVG", "Otimizador de Fotos", "Caça-Palavras", "Criador de Planners"].map((item, i) => (
                        <div
                            key={item}
                            className={clsx(
                                "group flex items-center gap-4 cursor-pointer transition-all duration-700 delay-[100ms]",
                                loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                            )}
                            style={{ transitionDelay: `${200 + (i * 100)}ms` }}
                        >
                            {/* Line: Expands and changes color on hover */}
                            <div className="h-[1px] w-8 bg-gray-700 transition-all duration-300 ease-out origin-left group-hover:w-12 group-hover:bg-cyan-400 group-hover:scale-x-150" />

                            {/* Text: Shifts right on hover */}
                            <span className="text-gray-500 text-2xl font-light transition-all duration-300 ease-out group-hover:text-white group-hover:translate-x-[5px]">
                                {item}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* 60% Space is left empty for the 3D Canvas */}
            <div className="w-[60%]"></div>
        </div>
    );
}
