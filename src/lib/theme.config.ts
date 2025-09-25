export type ThemeMode = 'light' | 'dark'
export type ColorProfile = 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'violet' | 'emerald' | 'amber' | 'cyan'

export interface ThemeConfig {
  mode: ThemeMode
  profile: ColorProfile
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
  }
  effects: {
    borderRadius: string
    shadow: string
    animation: string
    glassmorphism: boolean
    gradients: boolean
  }
}

// Configurações de cores baseadas no shadcn/ui
export const colorSchemes = {
  default: {
    light: {
      background: '0 0% 100%',
      foreground: '224 71.4% 4.1%',
      card: '0 0% 100%',
      cardForeground: '224 71.4% 4.1%',
      popover: '0 0% 100%',
      popoverForeground: '224 71.4% 4.1%',
      primary: '220.9 39.3% 11%',
      primaryForeground: '210 20% 98%',
      secondary: '220 14.3% 95.9%',
      secondaryForeground: '220.9 39.3% 11%',
      muted: '220 14.3% 95.9%',
      mutedForeground: '220 8.9% 46.1%',
      accent: '220 14.3% 95.9%',
      accentForeground: '220.9 39.3% 11%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 20% 98%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '224 71.4% 4.1%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '224 71.4% 4.1%',
      foreground: '210 20% 98%',
      card: '224 71.4% 4.1%',
      cardForeground: '210 20% 98%',
      popover: '224 71.4% 4.1%',
      popoverForeground: '210 20% 98%',
      primary: '210 20% 98%',
      primaryForeground: '220.9 39.3% 11%',
      secondary: '215 27.9% 16.9%',
      secondaryForeground: '210 20% 98%',
      muted: '215 27.9% 16.9%',
      mutedForeground: '0 0% 95%',
      accent: '215 27.9% 16.9%',
      accentForeground: '210 20% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 20% 98%',
      border: '215 27.9% 16.9%',
      input: '215 27.9% 16.9%',
      ring: '216 12.2% 83.9%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  blue: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%',
      success: '142 76% 36%',
      successForeground: '210 40% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 40% 98%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 84% 4.9%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 85%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '224.3 76.3% 94.1%',
      success: '142 76% 36%',
      successForeground: '210 40% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 40% 98%',
    }
  },
  purple: {
    light: {
      background: '0 0% 100%',
      foreground: '224 71.4% 4.1%',
      card: '0 0% 100%',
      cardForeground: '224 71.4% 4.1%',
      popover: '0 0% 100%',
      popoverForeground: '224 71.4% 4.1%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '210 20% 98%',
      secondary: '220 14.3% 95.9%',
      secondaryForeground: '220.9 39.3% 11%',
      muted: '220 14.3% 95.9%',
      mutedForeground: '220 8.9% 46.1%',
      accent: '220 14.3% 95.9%',
      accentForeground: '220.9 39.3% 11%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 20% 98%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '262.1 83.3% 57.8%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '224 71.4% 4.1%',
      foreground: '210 20% 98%',
      card: '224 71.4% 4.1%',
      cardForeground: '210 20% 98%',
      popover: '224 71.4% 4.1%',
      popoverForeground: '210 20% 98%',
      primary: '263.4 70% 50.4%',
      primaryForeground: '210 20% 98%',
      secondary: '215 27.9% 16.9%',
      secondaryForeground: '210 20% 98%',
      muted: '215 27.9% 16.9%',
      mutedForeground: '0 0% 95%',
      accent: '215 27.9% 16.9%',
      accentForeground: '210 20% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 20% 98%',
      border: '215 27.9% 16.9%',
      input: '215 27.9% 16.9%',
      ring: '263.4 70% 50.4%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  green: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '142.1 76.2% 36.3%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '142.1 70.6% 45.3%',
      primaryForeground: '144.9 80.4% 10%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '142.4 71.8% 29.2%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  orange: {
    light: {
      background: '0 0% 100%',
      foreground: '20 14.3% 4.1%',
      card: '0 0% 100%',
      cardForeground: '20 14.3% 4.1%',
      popover: '0 0% 100%',
      popoverForeground: '20 14.3% 4.1%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '60 4.8% 95.9%',
      secondaryForeground: '24 9.8% 10%',
      muted: '60 4.8% 95.9%',
      mutedForeground: '25 5.3% 44.7%',
      accent: '60 4.8% 95.9%',
      accentForeground: '24 9.8% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '60 9.1% 97.8%',
      border: '20 5.9% 90%',
      input: '20 5.9% 90%',
      ring: '24.6 95% 53.1%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '20 14.3% 4.1%',
      foreground: '60 9.1% 97.8%',
      card: '20 14.3% 4.1%',
      cardForeground: '60 9.1% 97.8%',
      popover: '20 14.3% 4.1%',
      popoverForeground: '60 9.1% 97.8%',
      primary: '20.5 90.2% 48.2%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '12 6.5% 15.1%',
      secondaryForeground: '60 9.1% 97.8%',
      muted: '12 6.5% 15.1%',
      mutedForeground: '0 0% 95%',
      accent: '12 6.5% 15.1%',
      accentForeground: '60 9.1% 97.8%',
      destructive: '0 72.2% 50.6%',
      destructiveForeground: '60 9.1% 97.8%',
      border: '12 6.5% 15.1%',
      input: '12 6.5% 15.1%',
      ring: '20.5 90.2% 48.2%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  rose: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '346.8 77.2% 49.8%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '346.8 77.2% 49.8%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '346.8 77.2% 49.8%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '346.8 77.2% 49.8%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  violet: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '210 20% 98%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '262.1 83.3% 57.8%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '263.4 70% 50.4%',
      primaryForeground: '210 20% 98%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '263.4 70% 50.4%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  emerald: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '158.1 64.4% 51.6%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '158.1 64.4% 51.6%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '158.1 64.4% 51.6%',
      primaryForeground: '355.7 100% 97.3%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '158.1 64.4% 51.6%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  amber: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '25 95% 53%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '25 95% 53%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '20.5 90.2% 48.2%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '20.5 90.2% 48.2%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  },
  cyan: {
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '188.7 94.5% 42.7%',
      primaryForeground: '0 0% 98%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      accentForeground: '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '188.7 94.5% 42.7%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 100%',
      card: '240 10% 3.9%',
      cardForeground: '0 0% 100%',
      popover: '240 10% 3.9%',
      popoverForeground: '0 0% 100%',
      primary: '188.7 94.5% 42.7%',
      primaryForeground: '0 0% 98%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 100%',
      muted: '240 3.7% 15.9%',
      mutedForeground: '0 0% 95%',
      accent: '240 3.7% 15.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%',
      input: '240 3.7% 15.9%',
      ring: '188.7 94.5% 42.7%',
      success: '142 76% 36%',
      successForeground: '210 20% 98%',
      warning: '38 92% 50%',
      warningForeground: '210 20% 98%',
    }
  }
}

export function getThemeConfig(mode: ThemeMode, profile: ColorProfile): ThemeConfig {
  const colorScheme = colorSchemes[profile] || colorSchemes.default
  const colors = mode === 'dark' ? colorScheme.dark : colorScheme.light
  
  return {
    mode,
    profile,
    colors: {
      background: colors.background,
      foreground: colors.foreground,
      card: colors.card,
      cardForeground: colors.cardForeground,
      popover: colors.popover,
      popoverForeground: colors.popoverForeground,
      primary: colors.primary,
      primaryForeground: colors.primaryForeground,
      secondary: colors.secondary,
      secondaryForeground: colors.secondaryForeground,
      muted: colors.muted,
      mutedForeground: colors.mutedForeground,
      accent: colors.accent,
      accentForeground: colors.accentForeground,
      destructive: (colors as any).destructive,
      destructiveForeground: (colors as any).destructiveForeground,
      border: colors.border,
      input: colors.input,
      ring: colors.ring,
      success: colors.success,
      successForeground: colors.successForeground,
      warning: colors.warning,
      warningForeground: colors.warningForeground,
    },
    effects: {
      borderRadius: '0.5rem',
      shadow: mode === 'dark' 
        ? '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)'
        : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      animation: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      glassmorphism: false,
      gradients: false,
    }
  }
}

export function applyThemeToDocument(config: ThemeConfig) {
  const root = document.documentElement
  
  // Apply colors as CSS custom properties
  Object.entries(config.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
  
  // Apply effects
  root.style.setProperty('--radius', config.effects.borderRadius)
  root.style.setProperty('--shadow', config.effects.shadow)
  root.style.setProperty('--animation', config.effects.animation)
  
  // Set theme classes
  root.className = `${config.mode} ${config.profile}`
  
  // Apply special effects
  if (config.effects.glassmorphism) {
    root.classList.add('glassmorphism')
  } else {
    root.classList.remove('glassmorphism')
  }
  
  if (config.effects.gradients) {
    root.classList.add('gradients')
  } else {
    root.classList.remove('gradients')
  }
}

// Função para obter todos os perfis de cor disponíveis
export function getAvailableColorProfiles(): ColorProfile[] {
  return Object.keys(colorSchemes) as ColorProfile[]
}

// Função para obter informações sobre um perfil de cor
export function getColorProfileInfo(profile: ColorProfile) {
  const profileNames: Record<ColorProfile, string> = {
    default: 'Padrão',
    blue: 'Azul',
    purple: 'Roxo',
    green: 'Verde',
    orange: 'Laranja',
    rose: 'Rosa',
    violet: 'Violeta',
    emerald: 'Esmeralda',
    amber: 'Âmbar',
    cyan: 'Ciano'
  }
  
  return {
    name: profileNames[profile] || profile,
    value: profile
  }
}
