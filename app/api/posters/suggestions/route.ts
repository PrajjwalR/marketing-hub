import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { posterSuggestionsModel } from '@/lib/gemini';
import type { StrategyPostersContext } from '@/lib/strategy-posters-context';
import {
    buildGenericRefinePrompt,
    buildGenericSuggestionsPrompt,
    buildStrategyAnchoredRefinePrompt,
    buildStrategyAnchoredSuggestionsPrompt,
    isStrategyPostersContext,
} from '@/lib/posters-suggestions-prompt';
import { parseSuggestionsModelResponse } from '@/lib/posters-suggestions-parse';

export async function POST(req: Request) {
    try {
        await getAuthUser(req);
        const body = await req.json();
        const type = (body?.type || 'image') as 'image' | 'video';
        const refine = body?.refine as { originalPrompt?: string; feedback?: string } | undefined;
        const strategyContext = body?.strategyContext as StrategyPostersContext | undefined;
        const anchored = strategyContext && isStrategyPostersContext(strategyContext);
        const rawStyle = body?.style as string | undefined;
        const rawTone = body?.tone as string | undefined;

        const STYLE_MAP: Record<string, string> = {
            'clean-modern': 'Standard Corporate / Clean modern design',
            'bollywood-drama': 'Bollywood Cinematic Drama / Desi Movie Poster',
            'ipl-fever': 'Cricket / IPL Match Day Sports Hype',
            'desi-wedding': 'Big Fat Indian Wedding / Traditional Festive Vibe',
            'gully-rap': 'Indian Street / Gully Rap / Raw Desi Hip-hop',
        };

        const TONE_MAP: Record<string, string> = {
            'brand-safe': 'Brand-safe, professional, and corporate',
            'gen-z-hinglish': 'Gen-Z Hinglish Slang, local pop culture references',
            'dramatic-desi': 'Dramatic, emotional, hyper-expressive Indian soap opera vibe',
            'cricket-hype': 'Sports stadium hype, aggressive, loud, cheering',
        };

        const style = rawStyle ? (STYLE_MAP[rawStyle] || rawStyle) : undefined;
        const tone = rawTone ? (TONE_MAP[rawTone] || rawTone) : undefined;

        const systemPrompt = refine?.originalPrompt
            ? anchored
                ? buildStrategyAnchoredRefinePrompt(type, strategyContext, {
                      originalPrompt: refine.originalPrompt,
                      feedback: refine.feedback,
                  })
                : buildGenericRefinePrompt(type, {
                      originalPrompt: refine.originalPrompt,
                      feedback: refine.feedback,
                  })
            : anchored
              ? buildStrategyAnchoredSuggestionsPrompt(type, strategyContext, style, tone)
              : buildGenericSuggestionsPrompt(type, style, tone);

        const result = await posterSuggestionsModel.generateContent(systemPrompt);
        const text = result.response.text();
        if (!text) throw new Error('No response from AI');

        const suggestions = parseSuggestionsModelResponse(text);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('[POSTERS_SUGGESTIONS]', error);
        const message = error instanceof Error ? error.message : 'Failed to get suggestions';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
