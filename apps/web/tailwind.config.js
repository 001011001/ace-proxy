/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brutalism §Colors — pure, loud, high-contrast ───
        terracotta: {
          DEFAULT: '#F97316',   // pure orange (from Download.html)
          press:   '#EA580C',   // deeper orange on press
          soft:    '#FFF7ED',   // hero bg / warm white
        },
        ocean: {
          DEFAULT: '#0f7b8c',
          soft:    '#e0f4f7',
        },
        ink: {
          DEFAULT:   '#111111',
          secondary: '#333333',
          mute:      '#666666',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          warm:    '#FFF7ED',
          gray:    '#F5F5F5',
        },
        hairline: {
          DEFAULT: '#000000',
          input:   '#000000',
        },
        success: {
          DEFAULT: '#16A34A',
          soft:    '#DCFCE7',
        },
        warning: {
          DEFAULT: '#EAB308',
          soft:    '#FEFCE8',
        },
        error: {
          DEFAULT: '#DC2626',
          soft:    '#FEE2E2',
        },
        price: {
          red:   '#DC2626',
          badge: '#F97316',
        },
        flag: {
          id: '#ce1126',
          th: '#2d2a4a',
          ph: '#0038a8',
          br: '#009b3a',
        },
      },
      fontFamily: {
        display:  ['"Archivo Black"', '"Arial Black"', 'Impact', 'Gadget', 'sans-serif'],
        body:     ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:     ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs:   '2px',
        sm:   '4px',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      fontSize: {
        // Brutalism typography scale — big, bold, uppercase-ready
        'display-xl': ['5rem',   { lineHeight: '0.9',  letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-lg': ['3.5rem', { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-md': ['2.25rem',{ lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '900' }],
        'heading-xl': ['1.5rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading-lg': ['1.25rem',{ lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],
        'heading-md': ['1.125rem',{ lineHeight: '1.2', fontWeight: '800' }],
        'heading-sm': ['1rem',   { lineHeight: '1.25', fontWeight: '700' }],
        'body-lg':    ['1.125rem', { lineHeight: '1.5' }],
        'body-md':    ['1rem',     { lineHeight: '1.5' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.45' }],
        'caption':    ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'micro':      ['0.6875rem',{ lineHeight: '1.35' }],
        'badge':      ['0.6875rem', { lineHeight: '1.0', letterSpacing: '0.06em', fontWeight: '800' }],
      },
      spacing: {
        'xxs':    '2px',
        'xs':     '4px',
        'sm2':    '8px',
        'md2':    '12px',
        'lg2':    '16px',
        'xl2':    '24px',
        'xxl':    '32px',
        'huge':   '48px',
        'massive':'64px',
      },
      boxShadow: {
        // ─── Brutalism shadows — zero blur, hard offset ───
        'brutal-sm':  '4px 4px 0 #000',
        'brutal-md':  '6px 6px 0 #000',
        'brutal-lg':  '8px 8px 0 #000',
        'brutal-xl':  '10px 10px 0 #000',
        // Keep legacy names for backwards compat
        'card':   '6px 6px 0 #000',
        'card-hover': '8px 8px 0 #000',
        'dropdown': '4px 4px 0 #000',
        'modal':  '8px 8px 0 #000',
      },
    },
  },
  plugins: [],
}
