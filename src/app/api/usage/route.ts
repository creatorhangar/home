import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: { get: (name) => cookieStore.get(name)?.value },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = new Date().toISOString().split('T')[0];

        // Ensure user has a record for today
        const { data, error } = await supabaseAdmin
            .from('usage_tracking')
            .select('usage_count')
            .eq('user_id', session.user.id)
            .eq('date', today)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Usage fetch error:', error);
        }

        return NextResponse.json({ count: data?.usage_count || 0 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: { get: (name) => cookieStore.get(name)?.value },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const today = new Date().toISOString().split('T')[0];

        // Atomic increment (upsert)
        // Note: Supabase doesn't support atomic increment in simple upsert easily without stored procedures or 2 steps.
        // For simplicity/robustness, we'll use a stored procedure if available, OR simple read-modify-write for MVP, 
        // OR better: use `rpc` if we had one.
        // Let's use a robust upsert approach assuming usage_tracking has (user_id, date) unique constraint.

        // 1. Get current
        const { data: current } = await supabaseAdmin
            .from('usage_tracking')
            .select('usage_count')
            .eq('user_id', session.user.id)
            .eq('date', today)
            .single();

        const newCount = (current?.usage_count || 0) + 1;

        const { error } = await supabaseAdmin
            .from('usage_tracking')
            .upsert({
                user_id: session.user.id,
                date: today,
                usage_count: newCount
            }, { onConflict: 'user_id,date' });

        if (error) throw error;

        return NextResponse.json({ count: newCount });

    } catch (error) {
        console.error('Usage update error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
