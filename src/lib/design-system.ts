/**
 * Bloom Design System
 * 
 * This design system embodies a bright, warm-ivory, human, playful, and premium educational aesthetic.
 * Drawing inspiration from the approachability of consumer learning apps and the refined execution 
 * of modern productivity tools, the UI evokes optimism, deep focus, and delightful engagement.
 */

export const bloomColors = {
  // Surface colors
  surface: '#faf9f7',
  surfaceDim: '#dadad8',
  surfaceBright: '#faf9f7',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f4f3f1',
  surfaceContainer: '#efeeec',
  surfaceContainerHigh: '#e9e8e6',
  surfaceContainerHighest: '#e3e2e0',
  
  // On-surface colors
  onSurface: '#1a1c1b',
  onSurfaceVariant: '#434655',
  inverseSurface: '#2f3130',
  inverseOnSurface: '#f1f1ef',
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  surfaceTint: '#0053db',
  
  // Primary colors (Electric Blue)
  primary: '#004ac6',
  onPrimary: '#ffffff',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#eeefff',
  inversePrimary: '#b4c5ff',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  onPrimaryFixed: '#00174b',
  onPrimaryFixedVariant: '#003ea8',
  
  // Secondary colors (Indigo)
  secondary: '#4b41e1',
  onSecondary: '#ffffff',
  secondaryContainer: '#645efb',
  onSecondaryContainer: '#fffbff',
  secondaryFixed: '#e2dfff',
  secondaryFixedDim: '#c3c0ff',
  onSecondaryFixed: '#0f0069',
  onSecondaryFixedVariant: '#3323cc',
  
  // Tertiary colors (Mint)
  tertiary: '#006242',
  onTertiary: '#ffffff',
  tertiaryContainer: '#007d55',
  onTertiaryContainer: '#bdffdb',
  tertiaryFixed: '#6ffbbe',
  tertiaryFixedDim: '#4edea3',
  onTertiaryFixed: '#002113',
  onTertiaryFixedVariant: '#005236',
  
  // Error colors (Coral)
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  
  // Background
  background: '#faf9f7',
  onBackground: '#1a1c1b',
  surfaceVariant: '#e3e2e0',
} as const;

export const bloomSpacing = {
  spaceXs: '0.25rem',
  spaceSm: '0.5rem',
  spaceMd: '1rem',
  spaceLg: '1.5rem',
  spaceXl: '2.5rem',
  space2xl: '4rem',
  gutter: '1.5rem',
  margin: '2rem',
} as const;

export const bloomRounded = {
  sm: '0.5rem',
  DEFAULT: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  full: '9999px',
} as const;

export const bloomTypography = {
  headlineXl: {
    fontFamily: 'Sora',
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '48px',
    letterSpacing: '-0.02em',
  },
  headlineXlMobile: {
    fontFamily: 'Sora',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '40px',
    letterSpacing: '-0.02em',
  },
  headlineLg: {
    fontFamily: 'Sora',
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '40px',
    letterSpacing: '-0.01em',
  },
  headlineLgMobile: {
    fontFamily: 'Sora',
    fontSize: '26px',
    fontWeight: '600',
    lineHeight: '32px',
    letterSpacing: '-0.01em',
  },
  headlineMd: {
    fontFamily: 'Space Grotesk',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '32px',
  },
  headlineSm: {
    fontFamily: 'Space Grotesk',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
  },
  bodyLg: {
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
  },
  bodySm: {
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '16px',
  },
  labelMd: {
    fontFamily: 'Space Grotesk',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
  },
  labelSm: {
    fontFamily: 'Space Grotesk',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '16px',
  },
  codeMd: {
    fontFamily: 'JetBrains Mono',
    fontSize: '13px',
    fontWeight: '400',
    lineHeight: '20px',
  },
} as const;

export const bloomShadows = {
  // Ambient, low-opacity shadows with subtle blue-gray undertones
  sm: '0 1px 8px rgba(0, 0, 0, 0.03)',
  DEFAULT: '0 10px 30px -10px rgba(37, 99, 235, 0.08)',
  md: '0 4px 20px -5px rgba(37, 99, 235, 0.1)',
  lg: '0 20px 40px -10px rgba(37, 99, 235, 0.12)',
  xl: '0 30px 60px -12px rgba(37, 99, 235, 0.15)',
} as const;

export const bloomBreakpoints = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1440px',
} as const;

// Animation durations
export const bloomAnimations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Bloom-specific utility classes for Tailwind
export const bloomUtilityClasses = {
  // Button styles
  buttonPrimary: 'inline-flex items-center gap-space-sm px-space-xl py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-md hover:bg-primary-container transition-all hover:scale-[1.02] active:scale-[0.98]',
  buttonSecondary: 'inline-flex items-center gap-space-sm px-space-xl py-3.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all',
  buttonGhost: 'inline-flex items-center gap-space-sm px-space-md py-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all',
  
  // Card styles
  card: 'bg-surface-container-lowest rounded-lg p-space-lg shadow-md',
  cardHover: 'bg-surface-container-lowest rounded-lg p-space-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.01]',
  
  // Badge styles
  badgePrimary: 'px-space-sm py-1 rounded-full bg-primary-fixed text-primary font-code-md text-xs font-semibold',
  badgeSecondary: 'px-space-sm py-1 rounded-full bg-secondary-fixed text-secondary font-code-md text-xs font-semibold',
  badgeTertiary: 'px-space-sm py-1 rounded-full bg-tertiary-fixed text-tertiary font-code-md text-xs font-semibold',
  badgeError: 'px-space-sm py-1 rounded-full bg-error-container text-error font-code-md text-xs font-semibold',
  
  // Input styles
  input: 'w-full px-space-md py-3 rounded-xl bg-surface-container-low border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-on-surface placeholder:text-on-surface-variant',
  
  // Progress bar
  progressBar: 'w-full bg-surface-container-high h-2 rounded-full overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-500',
} as const;