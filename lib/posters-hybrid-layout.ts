import sharp from 'sharp';
import type { ImageJsonSpec } from '@/lib/posters-gemini';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';
type Alignment = 'left' | 'center' | 'right';

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function normalizeText(value: string | undefined, maxChars: number): string {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxChars);
}

function resolvePlacement(spec: ImageJsonSpec): Placement {
    const placementText = `${spec.text_overlay?.placement || ''} ${spec.typography?.placement || ''}`.toLowerCase();
    if (placementText.includes('top')) return 'top';
    if (placementText.includes('bottom')) return 'bottom';
    if (placementText.includes('left')) return 'left';
    if (placementText.includes('right')) return 'right';
    return 'center';
}

function resolveAlignment(spec: ImageJsonSpec, placement: Placement): Alignment {
    const raw = String(spec.typography?.alignment || '').toLowerCase();
    if (raw === 'left' || raw === 'right' || raw === 'center') return raw;
    if (placement === 'left') return 'left';
    if (placement === 'right') return 'right';
    return 'center';
}

function sanitizeColor(input: string | undefined, fallback: string): string {
    const value = (input || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value)) return value;
    return fallback;
}

function wrapTextByChars(text: string, maxPerLine: number, maxLines: number): string[] {
    if (!text) return [];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxPerLine) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
            if (lines.length >= maxLines) break;
        }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines.slice(0, maxLines);
}

function buildOverlaySvg(params: {
    width: number;
    height: number;
    headline: string;
    subheadline: string;
    cta: string;
    placement: Placement;
    alignment: Alignment;
    textColor: string;
    accentColor: string;
    withPanel: boolean;
}) {
    const { width, height, headline, subheadline, cta, placement, alignment, textColor, accentColor, withPanel } = params;
    const margin = Math.round(Math.min(width, height) * 0.08);
    const boxWidth = Math.round(width * (placement === 'left' || placement === 'right' ? 0.42 : 0.62));
    const x =
        placement === 'left'
            ? margin
            : placement === 'right'
              ? width - margin - boxWidth
              : Math.round((width - boxWidth) / 2);
    const y =
        placement === 'top'
            ? margin
            : placement === 'bottom'
              ? Math.round(height - margin - height * 0.34)
              : Math.round((height - height * 0.34) / 2);
    const panelHeight = Math.round(height * 0.34);
    const textAnchor = alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';
    const tx = alignment === 'left' ? x + 20 : alignment === 'right' ? x + boxWidth - 20 : x + boxWidth / 2;

    const headlineLines = wrapTextByChars(headline, placement === 'left' || placement === 'right' ? 20 : 28, 2);
    const subLines = wrapTextByChars(subheadline, placement === 'left' || placement === 'right' ? 30 : 42, 2);
    const ctaLine = normalizeText(cta, 22);

    const headlineTspans = headlineLines
        .map((line, i) => `<tspan x="${tx}" dy="${i === 0 ? 0 : 44}">${escapeXml(line)}</tspan>`)
        .join('');
    const subTspans = subLines
        .map((line, i) => `<tspan x="${tx}" dy="${i === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`)
        .join('');

    const headlineY = y + 52;
    const subY = headlineY + Math.max(1, headlineLines.length) * 44 + 18;
    const ctaY = y + panelHeight - 52;
    const ctaWidth = Math.max(120, Math.min(260, ctaLine.length * 13 + 38));
    const ctaX = alignment === 'left' ? x + 20 : alignment === 'right' ? x + boxWidth - 20 - ctaWidth : x + (boxWidth - ctaWidth) / 2;

    const panel = withPanel
        ? `<rect x="${x}" y="${y}" width="${boxWidth}" height="${panelHeight}" rx="20" fill="rgba(15,23,42,0.52)" />`
        : '';

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="rgba(0,0,0,0.55)" />
    </filter>
  </defs>
  ${panel}
  <text x="${tx}" y="${headlineY}" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="42" fill="${textColor}" text-anchor="${textAnchor}" filter="url(#shadow)">${headlineTspans}</text>
  ${
      subTspans
          ? `<text x="${tx}" y="${subY}" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="24" fill="${textColor}" text-anchor="${textAnchor}" opacity="0.95">${subTspans}</text>`
          : ''
  }
  ${
      ctaLine
          ? `<g>
      <rect x="${ctaX}" y="${ctaY - 30}" width="${ctaWidth}" height="48" rx="24" fill="${accentColor}" />
      <text x="${ctaX + ctaWidth / 2}" y="${ctaY + 1}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="22" fill="#0f172a" text-anchor="middle">${escapeXml(ctaLine)}</text>
    </g>`
          : ''
  }
</svg>
`.trim();
}

export function hasDeterministicTextSpec(spec?: ImageJsonSpec): boolean {
    if (!spec?.text_overlay) return false;
    const h = normalizeText(spec.text_overlay.headline, 140);
    const s = normalizeText(spec.text_overlay.subheadline, 200);
    const c = normalizeText(spec.text_overlay.cta, 40);
    return Boolean(h || s || c);
}

export async function applyDeterministicPosterText(baseImage: Buffer, spec: ImageJsonSpec): Promise<Buffer> {
    const headline = normalizeText(spec.text_overlay?.headline, 140);
    const subheadline = normalizeText(spec.text_overlay?.subheadline, 220);
    const cta = normalizeText(spec.text_overlay?.cta, 40);
    if (!headline && !subheadline && !cta) return baseImage;

    const meta = await sharp(baseImage).metadata();
    const width = meta.width || 1280;
    const height = meta.height || 1280;

    const placement = resolvePlacement(spec);
    const alignment = resolveAlignment(spec, placement);
    const textColor = sanitizeColor(spec.text_overlay?.text_color, '#ffffff');
    const accentColor = sanitizeColor(spec.text_overlay?.accent_color || spec.color_system?.cta_color, '#f2d412');
    const treatment = String(spec.text_overlay?.background_treatment || '').toLowerCase();
    const withPanel = treatment.includes('overlay') || treatment.includes('band') || treatment.includes('gradient');

    const svg = buildOverlaySvg({
        width,
        height,
        headline,
        subheadline,
        cta,
        placement,
        alignment,
        textColor,
        accentColor,
        withPanel,
    });

    return sharp(baseImage)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toBuffer();
}
