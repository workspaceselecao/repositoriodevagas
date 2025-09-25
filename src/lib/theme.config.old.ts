export type ThemeMode = 'light' | 'dark'
export type ColorProfile = 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'violet' | 'emerald' | 'amber' | 'cyan'

export interface ThemeConfig {
  mode: ThemeMode
  profile: ColorProfile
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    destructive: string
    destructiveForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
  }
  effects: {
    glassmorphism: boolean
    gradients: boolean
    shadows: string
    borderRadius: string
    animation: string
  }
}

export const themeConfigs: Record<ColorProfile, Omit<ThemeConfig, 'mode'>> = {
  corporate: {
    profile: 'corporate',
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      secondary: 'hsl(210, 40%, 98%)',
      accent: 'hsl(210, 40%, 96%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      muted: 'hsl(210, 40%, 96%)',
      mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
      input: 'hsl(214.3, 31.8%, 91.4%)',
      ring: 'hsl(221, 83%, 53%)',
      destructive: 'hsl(0, 84.2%, 60.2%)',
      destructiveForeground: 'hsl(210, 40%, 98%)',
      success: 'hsl(142, 76%, 36%)',
      successForeground: 'hsl(210, 40%, 98%)',
      warning: 'hsl(38, 92%, 50%)',
      warningForeground: 'hsl(210, 40%, 98%)',
    },
    effects: {
      glassmorphism: false,
      gradients: false,
      shadows: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      borderRadius: '0.5rem',
      animation: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  vibrant: {
    profile: 'vibrant',
    colors: {
      primary: 'hsl(280, 100%, 70%)',
      secondary: 'hsl(300, 100%, 95%)',
      accent: 'hsl(320, 100%, 90%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(280, 100%, 20%)',
      muted: 'hsl(300, 100%, 95%)',
      mutedForeground: 'hsl(280, 50%, 50%)',
      border: 'hsl(280, 100%, 85%)',
      input: 'hsl(280, 100%, 85%)',
      ring: 'hsl(280, 100%, 70%)',
      destructive: 'hsl(0, 100%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      success: 'hsl(120, 100%, 40%)',
      successForeground: 'hsl(0, 0%, 100%)',
      warning: 'hsl(45, 100%, 50%)',
      warningForeground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      glassmorphism: false,
      gradients: true,
      shadows: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
      borderRadius: '0.75rem',
      animation: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  pastel: {
    profile: 'pastel',
    colors: {
      primary: 'hsl(200, 100%, 85%)',
      secondary: 'hsl(180, 100%, 95%)',
      accent: 'hsl(160, 100%, 90%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(200, 50%, 30%)',
      muted: 'hsl(180, 100%, 95%)',
      mutedForeground: 'hsl(200, 30%, 60%)',
      border: 'hsl(200, 100%, 90%)',
      input: 'hsl(200, 100%, 90%)',
      ring: 'hsl(200, 100%, 85%)',
      destructive: 'hsl(0, 100%, 80%)',
      destructiveForeground: 'hsl(0, 50%, 20%)',
      success: 'hsl(120, 100%, 80%)',
      successForeground: 'hsl(120, 50%, 20%)',
      warning: 'hsl(60, 100%, 80%)',
      warningForeground: 'hsl(60, 50%, 20%)',
    },
    effects: {
      glassmorphism: false,
      gradients: true,
      shadows: '0 2px 8px -2px rgb(0 0 0 / 0.05), 0 1px 3px -1px rgb(0 0 0 / 0.1)',
      borderRadius: '1rem',
      animation: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  glassmorphism: {
    profile: 'glassmorphism',
    colors: {
      primary: 'hsl(220, 100%, 60%)',
      secondary: 'hsla(220, 100%, 95%, 0.8)',
      accent: 'hsla(220, 100%, 90%, 0.6)',
      background: 'hsla(220, 100%, 98%, 0.9)',
      foreground: 'hsl(220, 50%, 20%)',
      muted: 'hsla(220, 100%, 95%, 0.7)',
      mutedForeground: 'hsla(220, 50%, 50%, 0.8)',
      border: 'hsla(220, 100%, 90%, 0.5)',
      input: 'hsla(220, 100%, 90%, 0.6)',
      ring: 'hsl(220, 100%, 60%)',
      destructive: 'hsl(0, 100%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      success: 'hsl(120, 100%, 50%)',
      successForeground: 'hsl(0, 0%, 100%)',
      warning: 'hsl(45, 100%, 50%)',
      warningForeground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      glassmorphism: true,
      gradients: true,
      shadows: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      borderRadius: '1rem',
      animation: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  minimal: {
    profile: 'minimal',
    colors: {
      primary: 'hsl(0, 0%, 9%)',
      secondary: 'hsl(0, 0%, 98%)',
      accent: 'hsl(0, 0%, 96%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(0, 0%, 9%)',
      muted: 'hsl(0, 0%, 96%)',
      mutedForeground: 'hsl(0, 0%, 45%)',
      border: 'hsl(0, 0%, 90%)',
      input: 'hsl(0, 0%, 90%)',
      ring: 'hsl(0, 0%, 9%)',
      destructive: 'hsl(0, 84%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 98%)',
      success: 'hsl(142, 76%, 36%)',
      successForeground: 'hsl(0, 0%, 98%)',
      warning: 'hsl(38, 92%, 50%)',
      warningForeground: 'hsl(0, 0%, 98%)',
    },
    effects: {
      glassmorphism: false,
      gradients: false,
      shadows: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      borderRadius: '0.25rem',
      animation: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}

export const darkThemeConfigs: Record<ColorProfile, Omit<ThemeConfig, 'mode'>> = {
  corporate: {
    profile: 'corporate',
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      secondary: 'hsl(222.2, 84%, 4.9%)',
      accent: 'hsl(217.2, 32.6%, 17.5%)',
      background: 'hsl(222.2, 84%, 4.9%)',
      foreground: 'hsl(210, 40%, 98%)',
      muted: 'hsl(217.2, 32.6%, 17.5%)',
      mutedForeground: 'hsl(215, 20.2%, 65.1%)',
      border: 'hsl(217.2, 32.6%, 17.5%)',
      input: 'hsl(217.2, 32.6%, 17.5%)',
      ring: 'hsl(221, 83%, 53%)',
      destructive: 'hsl(0, 62.8%, 30.6%)',
      destructiveForeground: 'hsl(210, 40%, 98%)',
      success: 'hsl(142, 76%, 36%)',
      successForeground: 'hsl(210, 40%, 98%)',
      warning: 'hsl(38, 92%, 50%)',
      warningForeground: 'hsl(210, 40%, 98%)',
    },
    effects: {
      glassmorphism: false,
      gradients: false,
      shadows: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
      borderRadius: '0.5rem',
      animation: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  vibrant: {
    profile: 'vibrant',
    colors: {
      primary: 'hsl(280, 100%, 70%)',
      secondary: 'hsl(280, 100%, 10%)',
      accent: 'hsl(280, 100%, 15%)',
      background: 'hsl(280, 100%, 5%)',
      foreground: 'hsl(280, 100%, 95%)',
      muted: 'hsl(280, 100%, 15%)',
      mutedForeground: 'hsl(280, 50%, 70%)',
      border: 'hsl(280, 100%, 20%)',
      input: 'hsl(280, 100%, 20%)',
      ring: 'hsl(280, 100%, 70%)',
      destructive: 'hsl(0, 100%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      success: 'hsl(120, 100%, 40%)',
      successForeground: 'hsl(0, 0%, 100%)',
      warning: 'hsl(45, 100%, 50%)',
      warningForeground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      glassmorphism: false,
      gradients: true,
      shadows: '0 10px 25px -5px rgb(0 0 0 / 0.4), 0 4px 6px -2px rgb(0 0 0 / 0.2)',
      borderRadius: '0.75rem',
      animation: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  pastel: {
    profile: 'pastel',
    colors: {
      primary: 'hsl(200, 100%, 70%)',
      secondary: 'hsl(200, 50%, 15%)',
      accent: 'hsl(200, 50%, 20%)',
      background: 'hsl(200, 50%, 10%)',
      foreground: 'hsl(200, 100%, 90%)',
      muted: 'hsl(200, 50%, 20%)',
      mutedForeground: 'hsl(200, 30%, 70%)',
      border: 'hsl(200, 50%, 25%)',
      input: 'hsl(200, 50%, 25%)',
      ring: 'hsl(200, 100%, 70%)',
      destructive: 'hsl(0, 100%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      success: 'hsl(120, 100%, 50%)',
      successForeground: 'hsl(0, 0%, 100%)',
      warning: 'hsl(60, 100%, 50%)',
      warningForeground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      glassmorphism: false,
      gradients: true,
      shadows: '0 2px 8px -2px rgb(0 0 0 / 0.3), 0 1px 3px -1px rgb(0 0 0 / 0.2)',
      borderRadius: '1rem',
      animation: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  glassmorphism: {
    profile: 'glassmorphism',
    colors: {
      primary: 'hsl(220, 100%, 60%)',
      secondary: 'hsla(220, 100%, 10%, 0.8)',
      accent: 'hsla(220, 100%, 15%, 0.6)',
      background: 'hsla(220, 100%, 5%, 0.9)',
      foreground: 'hsl(220, 100%, 90%)',
      muted: 'hsla(220, 100%, 15%, 0.7)',
      mutedForeground: 'hsla(220, 50%, 70%, 0.8)',
      border: 'hsla(220, 100%, 20%, 0.5)',
      input: 'hsla(220, 100%, 20%, 0.6)',
      ring: 'hsl(220, 100%, 60%)',
      destructive: 'hsl(0, 100%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      success: 'hsl(120, 100%, 50%)',
      successForeground: 'hsl(0, 0%, 100%)',
      warning: 'hsl(45, 100%, 50%)',
      warningForeground: 'hsl(0, 0%, 100%)',
    },
    effects: {
      glassmorphism: true,
      gradients: true,
      shadows: '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      borderRadius: '1rem',
      animation: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  minimal: {
    profile: 'minimal',
    colors: {
      primary: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(0, 0%, 9%)',
      accent: 'hsl(0, 0%, 14%)',
      background: 'hsl(0, 0%, 9%)',
      foreground: 'hsl(0, 0%, 98%)',
      muted: 'hsl(0, 0%, 14%)',
      mutedForeground: 'hsl(0, 0%, 63%)',
      border: 'hsl(0, 0%, 14%)',
      input: 'hsl(0, 0%, 14%)',
      ring: 'hsl(0, 0%, 98%)',
      destructive: 'hsl(0, 62.8%, 30.6%)',
      destructiveForeground: 'hsl(0, 0%, 98%)',
      success: 'hsl(142, 76%, 36%)',
      successForeground: 'hsl(0, 0%, 98%)',
      warning: 'hsl(38, 92%, 50%)',
      warningForeground: 'hsl(0, 0%, 98%)',
    },
    effects: {
      glassmorphism: false,
      gradients: false,
      shadows: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
      borderRadius: '0.25rem',
      animation: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}

export function getThemeConfig(mode: ThemeMode, profile: ColorProfile): ThemeConfig {
  const configs = mode === 'dark' ? darkThemeConfigs : themeConfigs
  const baseConfig = configs[profile]
  return {
    mode,
    profile: baseConfig.profile,
    colors: baseConfig.colors,
    effects: baseConfig.effects,
  }
}

export function applyThemeToDocument(config: ThemeConfig) {
  const root = document.documentElement
  
  // Apply colors
  Object.entries(config.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
  
  // Apply effects
  root.style.setProperty('--shadow', config.effects.shadows)
  root.style.setProperty('--radius', config.effects.borderRadius)
  root.style.setProperty('--animation', config.effects.animation)
  
  // Apply glassmorphism effect
  if (config.effects.glassmorphism) {
    root.classList.add('glassmorphism')
  } else {
    root.classList.remove('glassmorphism')
  }
  
  // Apply gradients
  if (config.effects.gradients) {
    root.classList.add('gradients')
  } else {
    root.classList.remove('gradients')
  }
  
  // Set theme class
  root.className = `${config.mode} ${config.profile}`
}
