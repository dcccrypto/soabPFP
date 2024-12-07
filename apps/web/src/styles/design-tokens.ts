export const colors = {
  // Brand Colors
  brand: {
    primary: '#f97316', // Orange 500
    secondary: '#facc15', // Yellow 400
    accent: '#fb923c', // Orange 400
  },

  // Background Colors
  background: {
    primary: '#0a0a0a', // Black
    secondary: '#18181b', // Zinc 900
    tertiary: '#27272a', // Zinc 800
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa', // Zinc 400
    tertiary: '#71717a', // Zinc 500
    accent: '#f97316', // Orange 500
  },

  // State Colors
  state: {
    success: '#22c55e', // Green 500
    warning: '#eab308', // Yellow 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
  },

  // Gradient Definitions
  gradients: {
    brand: 'linear-gradient(to right, #f97316, #facc15)',
    dark: 'linear-gradient(to bottom, #18181b, #0a0a0a)',
    glow: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.15), transparent)',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const typography = {
  fonts: {
    sans: 'var(--font-inter)',
    mono: 'var(--font-jetbrains-mono)',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

export const borders = {
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  widths: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  glow: '0 0 15px rgba(249, 115, 22, 0.5)',
} as const;

export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },
  timings: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    glow: {
      '0%, 100%': { opacity: '0.5' },
      '50%': { opacity: '1' },
    },
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const; 