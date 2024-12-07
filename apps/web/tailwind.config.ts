import type { Config } from "tailwindcss";
import { colors, typography, animations } from "./src/styles/design-tokens";
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        background: colors.background,
        text: colors.text,
        state: colors.state,
      },
      fontFamily: typography.fonts,
      fontSize: typography.sizes,
      fontWeight: typography.weights,
      lineHeight: typography.lineHeights,
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': colors.gradients.brand,
        'gradient-dark': colors.gradients.dark,
        'gradient-glow': colors.gradients.glow,
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: animations.keyframes.fadeIn,
        slideUp: animations.keyframes.slideUp,
        glow: animations.keyframes.glow,
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(249, 115, 22, 0.3)',
        'glow-md': '0 0 15px rgba(249, 115, 22, 0.4)',
        'glow-lg': '0 0 20px rgba(249, 115, 22, 0.5)',
        'glow-xl': '0 0 25px rgba(249, 115, 22, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: animations.durations,
      transitionTimingFunction: animations.timings,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    plugin(({ addUtilities }: { addUtilities: Function }) => {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
        },
        '.text-glow-lg': {
          textShadow: '0 0 15px rgba(249, 115, 22, 0.6)',
        },
        '.border-glow': {
          boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
        },
        '.bg-blur': {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
        '.scrollbar-hidden': {
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.mask-fade-out': {
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};

export default config;

</```
rewritten_file>