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
              ? buildStrategyAnchoredSuggestionsPrompt(type, strategyContext)
              : buildGenericSuggestionsPrompt(type);

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
