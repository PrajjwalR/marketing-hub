/**
 * Shared landing typography — one scale for section rhythm (headings, labels, body).
 * Import these strings and add layout spacing (mb-*, max-w-*) in each section as needed.
 */

/** Eyebrow text only (no margin) — use in nav rows or when spacing is custom */
export const landingEyebrowText = "text-xs font-bold uppercase tracking-[0.12em] text-zinc-500";

/** Section eyebrow: "Why Agent Elephant", "Integrations", etc. */
export const landingEyebrow = `${landingEyebrowText} mb-3`;

/** Eyebrow on dark backgrounds (e.g. pricing) */
export const landingEyebrowOnDark = "mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#F5C842]";

/**
 * Primary hero title only (largest on the page).
 */
export const landingHeroTitle =
    "text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.05em] text-zinc-900";

/**
 * Section H2 on light backgrounds (cream / white).
 */
export const landingSectionTitle =
    "text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.06em] text-zinc-900";

/**
 * Section H2 on dark backgrounds.
 */
export const landingSectionTitleOnDark =
    "text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.06em] text-white";

/** CTA band / footer headline (one step below section title). */
export const landingBandTitle =
    "text-[clamp(24px,2.75vw,32px)] font-bold leading-[1.15] tracking-[-0.04em] text-zinc-900";

/** Footer column titles (Product, Resources, …) */
export const landingFooterColumnTitle =
    "mb-4 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400";

/** Intro paragraph under section H2 */
export const landingSectionLead =
    "text-[17px] font-normal leading-relaxed text-zinc-500";

export const landingSectionLeadOnDark =
    "text-[17px] font-normal leading-relaxed text-white/45";

/** Small uppercase label inside cards (Strategy, testimonial category, etc.) */
export const landingCardKicker =
    "mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500";

/** H3-style titles: bento cards, how-it-works steps, testimonial card titles */
export const landingCardTitle =
    "text-xl font-bold leading-snug tracking-tight text-zinc-900";

/** Row titles in comparison columns */
export const landingComparisonRowTitle =
    "text-[15px] font-semibold leading-snug text-zinc-500";

export const landingComparisonRowTitleOnDark =
    "text-[15px] font-semibold leading-snug text-white/90";
