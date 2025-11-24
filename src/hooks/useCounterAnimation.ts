"use client";

import { useState } from "react";

export function useCounterAnimation(target: number, duration: number = 400) {
    const [count, setCount] = useState(0);
    const [prevTarget, setPrevTarget] = useState(target);

    if (target !== prevTarget) {
        setPrevTarget(target);

        let start = count;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }

    return count;
}
