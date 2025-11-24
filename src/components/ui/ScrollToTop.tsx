"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 hover:scale-110 transition-all duration-300 ease-out group"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300 ease-out" />
                </button>
            )}
        </>
    );
}
