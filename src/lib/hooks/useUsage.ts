import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

interface UseUsageOptions {
    toolName?: string;
    limit?: number;
}

export function useUsage(toolName: string = 'general', limit: number = 5) {
    const { user } = useAuth();
    const { isPro } = useSubscription(user?.id);
    const [usageCount, setUsageCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Initialize/Fetch usage
    useEffect(() => {
        const loadUsage = async () => {
            if (user) {
                try {
                    // Ideally the API should support toolName query param
                    // For now, preserving existing 'global' usage fetch for logged in users
                    // OR we assume unauth = tool specific, auth = global plan limit?
                    // Let's assume for this task we just want to fix unauth.
                    // If user is logged in, we use the server's global count (or whatever it returns)
                    // If we want per-tool limits for logged in users, the backend needs to support it.
                    // For now, let's keep logged-in logic mostly as-is but respecting the 'limit' arg if possible on client side

                    const response = await fetch('/api/usage');
                    if (response.ok) {
                        const data = await response.json();
                        setUsageCount(data.count);
                    }
                } catch (error) {
                    console.error('Failed to fetch usage:', error);
                }
            } else {
                // Local Storage for unauthenticated
                const today = new Date().toISOString().split('T')[0];
                const storageKey = `usage_${toolName}_${today}`;
                const stored = localStorage.getItem(storageKey);
                setUsageCount(stored ? parseInt(stored, 10) : 0);
            }
            setLoading(false);
        };

        loadUsage();
    }, [user, toolName]);

    const checkLimit = () => {
        if (user && isPro) return true; // Unlimited for Pro
        // If user is logged in (Free), we use the limit passed or the global free limit (5)
        // If user is NOT logged in, we use the limit passed (default 5)
        return usageCount < limit;
    };

    const incrementUsage = async () => {
        if (!checkLimit()) {
            throw new Error('LIMIT_REACHED');
        }

        // Optimistic update
        setUsageCount(prev => prev + 1);

        if (user) {
            try {
                const response = await fetch('/api/usage', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to record usage');
            } catch (error) {
                setUsageCount(prev => prev - 1);
                throw error;
            }
        } else {
            // Local Storage update
            const today = new Date().toISOString().split('T')[0];
            const storageKey = `usage_${toolName}_${today}`;
            localStorage.setItem(storageKey, (usageCount + 1).toString());
        }
    };

    return {
        usageCount,
        limit: (user && isPro) ? Infinity : limit,
        remaining: (user && isPro) ? Infinity : Math.max(0, limit - usageCount),
        checkLimit,
        incrementUsage,
        loading
    };
}
