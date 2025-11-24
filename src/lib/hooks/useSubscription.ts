import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface Subscription {
    plan_type: PlanType;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
}

export function useSubscription(userId: string | undefined) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        async function fetchSubscription() {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('plan_type, status, current_period_end, cancel_at_period_end')
                .eq('user_id', userId)
                .single();

            if (!error && data) {
                setSubscription(data);
            }
            setLoading(false);
        }

        fetchSubscription();

        // Subscribe to changes
        const channel = supabase
            .channel('subscription-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setSubscription(payload.new as Subscription);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const isPro = subscription?.plan_type === 'pro' && subscription?.status === 'active';
    const isEnterprise = subscription?.plan_type === 'enterprise' && subscription?.status === 'active';
    const isFree = subscription?.plan_type === 'free' || !subscription;
    const hasActiveSubscription = isPro || isEnterprise;

    return {
        subscription,
        loading,
        isPro,
        isEnterprise,
        isFree,
        hasActiveSubscription
    };
}
