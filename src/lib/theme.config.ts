/**
 * Sistema de Design - Repositório de Vagas
 * Configuração completa de temas e design tokens
 */

export const themeConfig = {
  // Paleta principal: Azul + Verde
  colors: {
    primary: {
      blue: {
        50: 'hsl(220, 100%, 97%)',
        100: 'hsl(220, 100%, 94%)',
        200: 'hsl(220, 100%, 88%)',
        300: 'hsl(220, 100%, 80%)',
        400: 'hsl(220, 100%, 70%)',
        500: 'hsl(220, 100%, 60%)', // Cor principal
        600: 'hsl(220, 100%, 50%)',
        700: 'hsl(220, 100%, 40%)',
        800: 'hsl(220, 100%, 30%)',
        900: 'hsl(220, 100%, 20%)',
        950: 'hsl(220, 100%, 10%)',
      },
      green: {
        50: 'hsl(142, 100%, 97%)',
        100: 'hsl(142, 100%, 94%)',
        200: 'hsl(142, 100%, 88%)',
        300: 'hsl(142, 100%, 80%)',
        400: 'hsl(142, 100%, 70%)',
        500: 'hsl(142, 76%, 36%)', // Cor secundária
        600: 'hsl(142, 100%, 30%)',
        700: 'hsl(142, 100%, 25%)',
        800: 'hsl(142, 100%, 20%)',
        900: 'hsl(142, 100%, 15%)',
        950: 'hsl(142, 100%, 10%)',
      }
    },
    // Estados universais
    semantic: {
      success: {
        50: 'hsl(142, 100%, 97%)',
        500: 'hsl(142, 76%, 36%)',
        600: 'hsl(142, 100%, 30%)',
        700: 'hsl(142, 100%, 25%)',
      },
      error: {
        50: 'hsl(0, 100%, 97%)',
        500: 'hsl(0, 84%, 60%)',
        600: 'hsl(0, 100%, 50%)',
        700: 'hsl(0, 100%, 40%)',
      },
      warning: {
        50: 'hsl(48, 100%, 97%)',
        500: 'hsl(48, 100%, 50%)',
        600: 'hsl(48, 100%, 45%)',
        700: 'hsl(48, 100%, 40%)',
      },
      info: {
        50: 'hsl(220, 100%, 97%)',
        500: 'hsl(220, 100%, 60%)',
        600: 'hsl(220, 100%, 50%)',
        700: 'hsl(220, 100%, 40%)',
      }
    },
    // Cinzas e neutros
    neutral: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 96%)',
      200: 'hsl(0, 0%, 90%)',
      300: 'hsl(0, 0%, 83%)',
      400: 'hsl(0, 0%, 64%)',
      500: 'hsl(0, 0%, 45%)',
      600: 'hsl(0, 0%, 32%)',
      700: 'hsl(0, 0%, 25%)',
      800: 'hsl(0, 0%, 15%)',
      900: 'hsl(0, 0%, 9%)',
      950: 'hsl(0, 0%, 4%)',
    }
  },

  // Tipografia
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },

  // Espaçamentos
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },

  // Border radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgb(59 130 246 / 0.3)',
  },

  // Animações
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Breakpoints responsivos
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '4k': '2560px',
  }
} as const

// Temas disponíveis
export type ThemeVariant = 
  | 'light' 
  | 'dark' 
  | 'tech-blue' 
  | 'fresh-green' 
  | 'neutral-gray' 
  | 'warm-pastel'

// Configurações específicas de cada tema
export const themeVariants = {
  light: {
    name: 'Claro',
    description: 'Tema padrão claro e limpo',
    colors: {
      background: themeConfig.colors.neutral[50],
      foreground: themeConfig.colors.neutral[900],
      primary: themeConfig.colors.primary.blue[500],
      secondary: themeConfig.colors.primary.green[500],
      muted: themeConfig.colors.neutral[100],
      accent: themeConfig.colors.primary.blue[100],
      border: themeConfig.colors.neutral[200],
      card: themeConfig.colors.neutral[50],
    }
  },
  dark: {
    name: 'Escuro',
    description: 'Tema escuro moderno',
    colors: {
      background: themeConfig.colors.neutral[900],
      foreground: themeConfig.colors.neutral[50],
      primary: themeConfig.colors.primary.blue[400],
      secondary: themeConfig.colors.primary.green[400],
      muted: themeConfig.colors.neutral[800],
      accent: themeConfig.colors.neutral[700],
      border: themeConfig.colors.neutral[700],
      card: themeConfig.colors.neutral[800],
    }
  },
  'tech-blue': {
    name: 'Tech Blue',
    description: 'Foco corporativo com azul predominante',
    colors: {
      background: themeConfig.colors.primary.blue[50],
      foreground: themeConfig.colors.primary.blue[900],
      primary: themeConfig.colors.primary.blue[600],
      secondary: themeConfig.colors.primary.blue[300],
      muted: themeConfig.colors.primary.blue[100],
      accent: themeConfig.colors.primary.blue[200],
      border: themeConfig.colors.primary.blue[200],
      card: themeConfig.colors.primary.blue[50],
    }
  },
  'fresh-green': {
    name: 'Fresh Green',
    description: 'Foco ecológico e leve',
    colors: {
      background: themeConfig.colors.primary.green[50],
      foreground: themeConfig.colors.primary.green[900],
      primary: themeConfig.colors.primary.green[600],
      secondary: themeConfig.colors.primary.green[300],
      muted: themeConfig.colors.primary.green[100],
      accent: themeConfig.colors.primary.green[200],
      border: themeConfig.colors.primary.green[200],
      card: themeConfig.colors.primary.green[50],
    }
  },
  'neutral-gray': {
    name: 'Neutral Gray',
    description: 'Corporativo neutro e profissional',
    colors: {
      background: themeConfig.colors.neutral[50],
      foreground: themeConfig.colors.neutral[900],
      primary: themeConfig.colors.neutral[600],
      secondary: themeConfig.colors.neutral[400],
      muted: themeConfig.colors.neutral[100],
      accent: themeConfig.colors.neutral[200],
      border: themeConfig.colors.neutral[200],
      card: themeConfig.colors.neutral[50],
    }
  },
  'warm-pastel': {
    name: 'Warm Pastel',
    description: 'Acentos suaves para engajamento',
    colors: {
      background: 'hsl(30, 100%, 98%)',
      foreground: 'hsl(30, 100%, 10%)',
      primary: 'hsl(30, 100%, 60%)',
      secondary: 'hsl(320, 100%, 60%)',
      muted: 'hsl(30, 100%, 95%)',
      accent: 'hsl(320, 100%, 90%)',
      border: 'hsl(30, 100%, 90%)',
      card: 'hsl(30, 100%, 98%)',
    }
  }
} as const

export default themeConfig
