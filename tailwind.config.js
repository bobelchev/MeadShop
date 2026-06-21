/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Brand Colors ────────────────────────────────────────────────────
      // honey  : amber/gold — primary accent, honey category
      // mead   : deep burgundy-plum — secondary accent, mead category
      // cream  : warm ivory — page backgrounds, card surfaces
      // bark   : dark warm brown — body text, headings
      // stone  : warm mid-grey — muted text, borders, dividers
      colors: {
        honey: {
          50:  '#FEF9EC',
          100: '#FDF0C8',
          200: '#FAE08E',
          300: '#F6CA52',
          400: '#F2B425',
          500: '#D4940C',   // default — vivid amber
          600: '#B8770A',   // hover state for honey CTA
          700: '#8A5A04',   // text on light backgrounds
          800: '#5C3A02',
          900: '#3A2401',
        },
        mead: {
          50:  '#F7F0F5',
          100: '#ECDDE8',
          200: '#D4B0CA',
          300: '#B87DAA',
          400: '#8E4A7E',
          500: '#6B2A5C',   // default — deep plum
          600: '#561F49',
          700: '#4A1A3A',   // hover state for mead CTA, dark accents
          800: '#321228',
          900: '#1E0B18',
        },
        cream: {
          50:  '#FAF7F0',   // page background
          100: '#F5EDDC',   // card background, slightly warmer
          200: '#EBD9B8',   // border, divider
          300: '#D9C295',   // stronger border
          400: '#C4A36A',   // decorative rule
        },
        bark: {
          50:  '#F5EFE8',
          100: '#E8D9C8',
          200: '#C8A882',
          300: '#A87A50',
          400: '#7A5230',
          500: '#5C3A1E',
          600: '#40260F',
          700: '#2A1A0E',   // primary heading / body text
          800: '#1A0F08',
          900: '#0D0704',
        },
        stone: {
          100: '#F0EBE3',
          200: '#DDD4C8',
          300: '#BEB2A4',
          400: '#9C8E7E',
          500: '#7A6C5C',   // muted text
          600: '#5C5048',
          700: '#3E3630',
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────
      // display : Playfair Display — editorial serif, warmth and craft authority
      // body    : Inter — clean humanist sans, legible in both BG and EN scripts
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // ─── Font Sizes ──────────────────────────────────────────────────────
      // Augments Tailwind defaults — adds a hero-scale and a label scale
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.35rem' }],
        'base': ['1rem',     { lineHeight: '1.625rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl':  ['3rem',     { lineHeight: '3.5rem' }],
        'hero': ['3.75rem',  { lineHeight: '4.25rem', letterSpacing: '-0.02em' }],
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      // The brand is soft and organic — no sharp corners, but not bubbly.
      // sm: inline badges and tags
      // DEFAULT/md: buttons, inputs
      // lg: cards
      // xl: modals, hero panels
      borderRadius: {
        'none': '0px',
        'sm':   '4px',
        'DEFAULT': '6px',
        'md':   '6px',
        'lg':   '10px',
        'xl':   '16px',
        '2xl':  '24px',
        'full': '9999px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      // Warm-tinted shadows — never pure grey/black
      boxShadow: {
        'card':       '0 2px 8px 0 rgba(42, 26, 14, 0.08)',
        'card-hover': '0 6px 20px 0 rgba(42, 26, 14, 0.14)',
        'btn':        '0 1px 3px 0 rgba(42, 26, 14, 0.20)',
        'btn-hover':  '0 3px 8px 0 rgba(42, 26, 14, 0.25)',
        'modal':      '0 20px 60px 0 rgba(42, 26, 14, 0.20)',
        'inner-soft': 'inset 0 1px 3px 0 rgba(42, 26, 14, 0.08)',
      },

      // ─── Spacing additions ───────────────────────────────────────────────
      // Base unit: 4px (Tailwind default). No override needed.
      // Named section spacing used as reference in prose docs below:
      //   section-y padding: py-16 (64px) desktop, py-10 (40px) mobile
      //   content-x padding: px-6 (24px) mobile, px-8 (32px) md, px-16 (64px) lg
      //   card gap: gap-6 (24px)

      // ─── Transitions ─────────────────────────────────────────────────────
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '180': '180ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
