/**
 * Parse poster suggestion strings from Gemini output.
 * Primary path: structured JSON (responseMimeType + responseSchema) — plain array string.
 * Fallback: salvage arrays/objects from messy or fenced text.
 */

function stripCodeFences(raw: string): string {
    let s = raw.trim();
    if (s.startsWith('```')) {
        s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    return s;
}

function normalizeQuotes(s: string): string {
    return s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"').replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
}

/**
 * Find the first top-level JSON array by bracket depth, respecting strings and escapes.
 */
export function extractBalancedJsonArray(s: string): string | null {
    const start = s.indexOf('[');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < s.length; i++) {
        const ch = s[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (inString) {
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') inString = false;
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === '[') depth++;
        else if (ch === ']') {
            depth--;
            if (depth === 0) return s.slice(start, i + 1);
        }
    }

    return null;
}

function extractBalancedJsonObject(s: string): string | null {
    const start = s.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < s.length; i++) {
        const ch = s[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (inString) {
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') inString = false;
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) return s.slice(start, i + 1);
        }
    }

    return null;
}

function tryJsonParse(json: string): unknown {
    const s = json.trim();
    const variants = new Set<string>();
    variants.add(s);
    variants.add(s.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}'));
    variants.add(s.replace(/,\s*,/g, ','));
    variants.add(
        s
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*,/g, ',')
    );

    for (const candidate of variants) {
        try {
            return JSON.parse(candidate);
        } catch {
            /* next */
        }
    }

    throw new SyntaxError('Could not parse JSON');
}

function coerceToStringList(parsed: unknown): string[] {
    if (!Array.isArray(parsed)) {
        throw new Error('Response is not a JSON array');
    }

    return parsed
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
                const o = item as Record<string, unknown>;
                if (typeof o.prompt === 'string') return o.prompt.trim();
                if (typeof o.text === 'string') return o.text.trim();
                if (typeof o.suggestion === 'string') return o.suggestion.trim();
            }
            if (item == null) return '';
            return String(item).trim();
        })
        .filter((x) => x.length > 0);
}

function arrayFromWrapperObject(o: Record<string, unknown>): string[] | null {
    for (const key of ['suggestions', 'prompts', 'items', 'strings', 'outputs']) {
        const v = o[key];
        if (Array.isArray(v)) return coerceToStringList(v);
    }
    return null;
}

/**
 * Used when model returns JSON `{ ... }` with an array field.
 */
export function parseSuggestionStringsFromLlmLoose(raw: string): string[] {
    if (!raw?.trim()) {
        throw new Error('Empty model response');
    }

    const stripped = normalizeQuotes(stripCodeFences(raw));

    // Whole value is an array
    const trimmed = stripped.trim();
    if (trimmed.startsWith('[')) {
        const slice = extractBalancedJsonArray(stripped) ?? trimmed;
        const parsed = tryJsonParse(slice);
        const strings = coerceToStringList(parsed);
        if (strings.length === 0) throw new Error('No usable prompt strings in array');
        return strings.slice(0, 8);
    }

    // Whole value is an object with array property
    if (trimmed.startsWith('{')) {
        const slice = extractBalancedJsonObject(stripped) ?? trimmed;
        const parsed = tryJsonParse(slice);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const list = arrayFromWrapperObject(parsed as Record<string, unknown>);
            if (list?.length) return list.slice(0, 8);
        }
    }

    // Prose + embedded array
    const arraySlice = extractBalancedJsonArray(stripped);
    if (arraySlice) {
        const parsed = tryJsonParse(arraySlice);
        const strings = coerceToStringList(parsed);
        if (strings.length > 0) return strings.slice(0, 8);
    }

    const objectSlice = extractBalancedJsonObject(stripped);
    if (objectSlice) {
        const parsed = tryJsonParse(objectSlice);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const list = arrayFromWrapperObject(parsed as Record<string, unknown>);
            if (list?.length) return list.slice(0, 8);
        }
    }

    throw new Error('No JSON array found in model response');
}

/**
 * Parse Gemini response when using structured output (`posterSuggestionsModel`).
 * Falls back to loose parsing if the SDK ever returns extra wrapping.
 */
export function parseSuggestionsModelResponse(raw: string): string[] {
    if (!raw?.trim()) {
        throw new Error('Empty model response');
    }

    const stripped = normalizeQuotes(stripCodeFences(raw.trim()));

    try {
        const parsed = tryJsonParse(stripped);
        if (Array.isArray(parsed)) {
            const strings = coerceToStringList(parsed);
            if (strings.length > 0) return strings.slice(0, 8);
        }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const list = arrayFromWrapperObject(parsed as Record<string, unknown>);
            if (list?.length) return list.slice(0, 8);
        }
    } catch {
        /* fall through */
    }

    return parseSuggestionStringsFromLlmLoose(raw);
}
