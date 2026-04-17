/**
 * Utility for dynamically loading Google Fonts into the browser
 * to ensure Fabric.js can render them correctly on the canvas.
 */

export const DESIGN_FONTS = [
  { name: 'Manrope', family: 'Manrope' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Playfair Display', family: 'Playfair Display' },
  { name: 'Space Grotesk', family: 'Space Grotesk' },
  { name: 'Inter', family: 'Inter' },
  { name: 'Outfit', family: 'Outfit' },
  { name: 'Unbounded', family: 'Unbounded' },
  { name: 'Bebas Neue', family: 'Bebas Neue' },
  { name: 'Fraunces', family: 'Fraunces' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond' },
  { name: 'Syne', family: 'Syne' },
  { name: 'Archivo Black', family: 'Archivo Black' },
  { name: 'DM Sans', family: 'DM Sans' },
  { name: 'Quicksand', family: 'Quicksand' },
  { name: 'Cabin', family: 'Cabin' },
  { name: 'Fira Sans', family: 'Fira Sans' },
  { name: 'Josefin Sans', family: 'Josefin Sans' },
  { name: 'League Spartan', family: 'League Spartan' },
  { name: 'Lora', family: 'Lora' },
  { name: 'Libre Baskerville', family: 'Libre Baskerville' },
];

export async function loadFont(family: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Check if font is already loaded
  if (document.fonts.check(`1em "${family}"`)) {
    return;
  }

  // Build Google Fonts URL
  const urlSafeFamily = family.replace(/ /g, '+');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${urlSafeFamily}:wght@400;700&display=swap`;

  // Inject font stylesheet
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';
    link.onload = () => {
      // Small delay to ensure browser processes the font face
      setTimeout(() => resolve(), 300);
    };
    link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
    document.head.appendChild(link);
  });
}

/**
 * Ensures a font is ready for canvas rendering
 */
export async function ensureFont(family: string): Promise<void> {
    try {
        await loadFont(family);
        // Wait for doc fonts to be ready
        await document.fonts.ready;
    } catch (err) {
        console.error("Font loading error:", err);
    }
}
