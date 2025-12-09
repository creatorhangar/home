'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

interface UseUsageLimitReturn {
    hasAccess: boolean;
    remaining: number;
    incrementUsage: () => void;
    isLoading: boolean;
}

export function useUsageLimit(toolKey: string, dailyLimit: number = 3): UseUsageLimitReturn {
    const { user, loading: authLoading } = useAuth();
    const { isPro, loading: subLoading } = useSubscription(user?.id);

    // State to track local usage for non-logged users
    const [usageCount, setUsageCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || subLoading) return;

        // If user is logged in, we might check server-side limits or just rely on subscription
        // For now, if logged in + Pro -> unlimited
        // If logged in + Free -> maybe server limits (not implemented yet, assuming unlimited for logged in for now or separate logic)
        // This hook specifically targets unauthenticated users as per current task

        if (!user) {
            // Load usage from localStorage
            const storageKey = `usage_${toolKey}_${new Date().toISOString().split('T')[0]}`;
            const stored = localStorage.getItem(storageKey);
            setUsageCount(stored ? parseInt(stored, 10) : 0);
        }

        setIsLoading(false);
    }, [user, authLoading, subLoading, toolKey]);

    const incrementUsage = () => {
        if (user) return; // Don't track local usage for logged in users

        const today = new Date().toISOString().split('T')[0];
        const storageKey = `usage_${toolKey}_${today}`;

        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
    };

    // Determine access
    // 1. If loading, allow (or block until loaded? better to block) -> return false access but isLoading true
    if (authLoading || subLoading || isLoading) {
        return { hasAccess: false, remaining: 0, incrementUsage, isLoading: true };
    }

    // 2. If user is logged in -> allow access (assuming logged in users have their own limits handled elsewhere or are unlimited for now)
    if (user) {
        return { hasAccess: true, remaining: 9999, incrementUsage, isLoading: false };
    }

    // 3. Unauthenticated -> check limit
    const remaining = Math.max(0, dailyLimit - usageCount);

    return {
        hasAccess: remaining > 0,
        remaining,
        incrementUsage,
        isLoading: false
    };
}
