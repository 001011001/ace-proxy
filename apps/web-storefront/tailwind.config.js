/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Neo-Brutalism §Colors — 与 apps/web 管理后台保持一致 ───
        terracotta: {
          DEFAULT: '#F97316', // 主色：纯橙
          press: '#EA580C', // 按下态：深橙
          soft: '#FFF7ED', // 英雄区背景 / 暖白
        },
        ocean: {
          DEFAULT: '#0f7b8c',
          soft: '#e0f4f7',
        },
        ink: {
          DEFAULT: '#111111',
          secondary: '#333333',
          mute: '#666666',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          warm: '#FFF7ED',
          gray: '#F5F5F5',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#EAB308',
          soft: '#FEFCE8',
        },
        error: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
        },
        price: {
          red: '#DC2626',
          badge: '#F97316',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Arial Black"', 'Impact', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      borderWidth: {
        3: '3px',
        4: '4px',
      },
      borderRadius: {
        // Neo-Brutalism：pill 按钮 + 极小圆角
        none: '0px',
        xs: '2px',
        sm: '4px',
        pill: '9999px',
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '0.9', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-lg': ['3.5rem', { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-md': ['2.25rem', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '900' }],
        'heading-xl': ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading-lg': ['1.25rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],
        'heading-md': ['1.125rem', { lineHeight: '1.2', fontWeight: '800' }],
        'heading-sm': ['1rem', { lineHeight: '1.25', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        'body-md': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.45' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        micro: ['0.6875rem', { lineHeight: '1.35' }],
        badge: ['0.6875rem', { lineHeight: '1.0', letterSpacing: '0.06em', fontWeight: '800' }],
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm2: '8px',
        md2: '12px',
        lg2: '16px',
        xl2: '24px',
        xxl: '32px',
        huge: '48px',
        massive: '64px',
      },
      boxShadow: {
        // ─── Neo-Brutalism 硬阴影 — 零模糊、硬偏移 ───
        'brutal-sm': '4px 4px 0 #000',
        'brutal-md': '6px 6px 0 #000',
        'brutal-lg': '8px 8px 0 #000',
        'brutal-xl': '10px 10px 0 #000',
        'brutal-sm-press': '1px 1px 0 #000',
        'brutal-md-press': '2px 2px 0 #000',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-badge': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'pulse-badge': 'pulse-badge 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
