import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';
import { generateStrategyPosts } from '@/lib/strategy-gemini';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getAuthUser(req);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const {
            businessType,
            brandName,
            targetAudience,
            goal,
            strategyType,
            platforms,
            theme,
            durationDays,
            startDate,
            is_prebuilt,
        } = body;

        if (!brandName || !platforms?.length || !durationDays || !startDate) {
            return NextResponse.json(
                { error: 'Brand name, platforms, duration, and start date are required' },
                { status: 400 }
            );
        }

        const posts = await generateStrategyPosts({
            businessType: businessType || 'Other',
            brandName: String(brandName).trim(),
            targetAudience: targetAudience || '',
            goal: goal || 'brand_awareness',
            strategyType: typeof strategyType === 'string' ? strategyType : undefined,
            platforms: Array.isArray(platforms) ? platforms : [],
            theme: theme || undefined,
            durationDays: Number(durationDays) || 30,
        });

        const strategyName = (() => {
            const rawTheme = typeof theme === 'string' ? theme.trim() : '';
            if (!rawTheme) return String(brandName).trim();

            // Keep DB tagging in `theme`, but show a human-friendly name in the UI.
            const displayTheme = rawTheme
                .replace(/^prebuilt_[a-z]+_/, '')
                .replace(/^gym_/, '')
                .replace(/^jewellery_/, '')
                .replace(/^ecom_/, '')
                .replace(/_/g, ' ');
            return `${String(brandName).trim()} – ${displayTheme}`;
        })();

        const { data: strategy, error: strategyError } = await supabaseAdmin
            .from('strategies')
            .insert({
                user_id: userId,
                name: strategyName,
                business_type: businessType || null,
                brand_name: String(brandName).trim(),
                target_audience: targetAudience || null,
                goal: goal || null,
                platforms: platforms || [],
                    theme: theme || null,
                duration_days: Number(durationDays) || 30,
                start_date: startDate,
                is_prebuilt: !!is_prebuilt,
            })
            .select()
            .single();

        if (strategyError) {
            console.error('[STRATEGY_GENERATE] Strategy Insert Error:', strategyError);
            return NextResponse.json({ error: strategyError.message }, { status: 500 });
        }

        const postsToInsert = posts.map((p) => ({
            strategy_id: strategy.id,
            day: p.day,
            platform: p.platform,
            content_type: p.content_type,
            theme: p.theme,
            idea: p.idea,
            caption: p.caption,
            goal: p.goal,
            status: p.status,
            post_time: p.post_time || '10:00 AM',
            include_in_calendar: true,
        }));

        const { data: insertedPosts, error: postsError } = await supabaseAdmin
            .from('strategy_posts')
            .insert(postsToInsert)
            .select();

        if (postsError) {
            await supabaseAdmin.from('strategies').delete().eq('id', strategy.id);
            console.error('[STRATEGY_GENERATE] Posts Insert Error:', postsError);
            return NextResponse.json({ error: postsError.message }, { status: 500 });
        }

        return NextResponse.json(
            { strategy: { ...strategy, posts: insertedPosts } },
            { status: 201 }
        );
    } catch (error) {
        console.error('[STRATEGY_GENERATE]', error);
        const message = error instanceof Error ? error.message : 'Failed to generate strategy';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
