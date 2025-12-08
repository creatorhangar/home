import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export function useUsage() {
    const { user } = useAuth();
    const { isPro } = useSubscription(user?.id);
    const [usageCount, setUsageCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const FREE_LIMIT = 5;

    useEffect(() => {
        if (!user) return;
        fetchUsage();
    }, [user]);

    const fetchUsage = async () => {
        try {
            const response = await fetch('/api/usage');
            if (response.ok) {
                const data = await response.json();
                setUsageCount(data.count);
            }
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkLimit = () => {
        if (isPro) return true; // Unlimited for Pro
        return usageCount < FREE_LIMIT;
    };

    const incrementUsage = async () => {
        if (!checkLimit()) {
            throw new Error('LIMIT_REACHED');
        }

        // Optimistic update
        setUsageCount(prev => prev + 1);

        try {
            const response = await fetch('/api/usage', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to record usage');
        } catch (error) {
            // Revert if failed
            setUsageCount(prev => prev - 1);
            throw error;
        }
    };

    return {
        usageCount,
        limit: isPro ? Infinity : FREE_LIMIT,
        remaining: isPro ? Infinity : Math.max(0, FREE_LIMIT - usageCount),
        checkLimit,
        incrementUsage,
        loading
    };
}
