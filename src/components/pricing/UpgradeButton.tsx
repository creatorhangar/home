'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { BillingPeriod } from '@/lib/stripe-prices';

interface UpgradeButtonProps {
    period?: BillingPeriod;
    className?: string;
    children?: React.ReactNode;
}

export default function UpgradeButton({
    period = 'monthly',
    className = '',
    children
}: UpgradeButtonProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpgrade = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    period,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            console.error('Upgrade error:', err);
            setError(err.message || 'Erro ao processar upgrade');
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleUpgrade}
                disabled={loading}
                className={className || "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"}
            >
                {loading ? 'Processando...' : (children || 'Upgrade para Pro')}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
