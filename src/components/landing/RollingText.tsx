"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const items = [
    { text: "Tabs", color: "#6B5B95" },      // Purple
    { text: "Emails", color: "#E8834F" },    // Orange
    { text: "Calendars", color: "#6B5B95" }, // Purple
    { text: "Vectors", color: "#E8834F" },   // Orange
    { text: "Planners", color: "#6B5B95" },  // Purple
    { text: "Tools", color: "#E8834F" }      // Orange
];

const listItems = [...items, ...items, ...items]; // Triple for looping

interface RollingTextProps {
    onHoverColor?: (color: string) => void;
}

export function RollingText({ onHoverColor }: RollingTextProps) {
    return (
        <div className="flex flex-col items-start justify-center h-full z-10 relative pointer-events-auto w-full">
            <h2 className="text-white/40 text-xs uppercase tracking-[0.4em] mb-8 font-sans ml-1">
                Creative Tools
            </h2>

            <div className="relative h-[400px] w-full overflow-hidden mask-gradient-vertical">
                {/* Gradient Masks - Dark Mode */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ y: [0, -items.length * 100] }} // Adjust based on item height
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex flex-col gap-4"
                >
                    {listItems.map((item, i) => (
                        <div
                            key={i}
                            className="h-[100px] flex items-center justify-start"
                        >
                            <span
                                className="text-6xl md:text-8xl font-display font-medium tracking-tight transition-all duration-300 hover:scale-105 cursor-pointer"
                                style={{
                                    color: '#ffffff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#6B5B95';
                                    e.currentTarget.style.textShadow = '0 0 30px rgba(107, 91, 149, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#ffffff';
                                    e.currentTarget.style.textShadow = 'none';
                                }}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
