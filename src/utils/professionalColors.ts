// Professional Interactive Color Scheme
// Embodying genius and intelligence with deep, sophisticated colors

export const PROFESSIONAL_COLORS = {
  // Deep base colors - sophisticated and minimal
  background: {
    primary: '#0F172A',     // Deep slate
    secondary: '#1E293B',   // Slate 800
    tertiary: '#334155',    // Slate 600
    surface: '#F8FAFC',     // Light surface
  },
  
  // Intelligent accent colors - strategic use
  accents: {
    deepGreen: '#064E3B',   // Emerald 900 - key mathematical concepts
    forestGreen: '#065F46', // Emerald 800 - success states
    steel: '#475569',       // Slate 600 - neutral elements
    charcoal: '#374151',    // Gray 700 - text and borders
  },
  
  // Key staff colors - minimal but impactful
  keyStaff: {
    blue: '#1E40AF',        // Blue 800 - primary interactive elements
    deepBlue: '#1E3A8A',    // Blue 900 - focused states
    orange: '#EA580C',      // Orange 600 - warning/attention
    deepOrange: '#C2410C',  // Orange 700 - error states
    red: '#DC2626',         // Red 600 - critical errors
    deepRed: '#B91C1C',     // Red 700 - danger
  },
  
  // Minimal highlights - used sparingly
  highlights: {
    emerald: '#10B981',     // Emerald 500 - success
    amber: '#F59E0B',       // Amber 500 - caution
    slate: '#64748B',       // Slate 500 - muted
    white: '#FFFFFF',       // Pure white
    ghost: '#F1F5F9',       // Slate 100 - subtle backgrounds
  },
  
  // Text hierarchy - readable and professional
  text: {
    primary: '#0F172A',     // Slate 900 - main text
    secondary: '#475569',   // Slate 600 - secondary text
    muted: '#64748B',       // Slate 500 - muted text
    inverted: '#F8FAFC',    // Light text on dark
    accent: '#1E40AF',      // Blue for links/interactive
  },
  
  // Interactive states
  states: {
    hover: '#F1F5F9',       // Slate 100 - hover backgrounds
    active: '#E2E8F0',      // Slate 200 - active backgrounds
    focused: '#1E40AF',     // Blue 800 - focus rings
    disabled: '#94A3B8',    // Slate 400 - disabled elements
  }
};

// Gradient combinations for sophisticated effects
export const PROFESSIONAL_GRADIENTS = {
  primary: 'from-slate-900 via-slate-800 to-slate-900',
  surface: 'from-slate-50 to-white',
  interactive: 'from-blue-800 to-blue-900',
  success: 'from-emerald-800 to-emerald-900',
  warning: 'from-orange-600 to-orange-700',
  error: 'from-red-600 to-red-700',
  
  // Subtle overlays
  overlay: 'from-slate-900/90 to-slate-800/90',
  glass: 'from-white/10 to-white/5',
};

// Professional shadows
export const PROFESSIONAL_SHADOWS = {
  minimal: 'shadow-sm',
  card: 'shadow-lg shadow-slate-200/50',
  interactive: 'shadow-xl shadow-blue-200/25',
  deep: 'shadow-2xl shadow-slate-900/25',
};

// Usage patterns for different components
export const COMPONENT_THEMES = {
  interactiveGraph: {
    background: PROFESSIONAL_COLORS.background.surface,
    border: PROFESSIONAL_COLORS.accents.steel,
    gridLines: PROFESSIONAL_COLORS.highlights.slate,
    primaryLine: PROFESSIONAL_COLORS.keyStaff.blue,
    secondaryLine: PROFESSIONAL_COLORS.keyStaff.deepBlue,
    point: PROFESSIONAL_COLORS.keyStaff.orange,
    activePoint: PROFESSIONAL_COLORS.keyStaff.deepOrange,
    text: PROFESSIONAL_COLORS.text.primary,
    legend: PROFESSIONAL_COLORS.text.secondary,
  },
  
  solutionBuilder: {
    background: PROFESSIONAL_COLORS.background.surface,
    stepBackground: PROFESSIONAL_COLORS.highlights.ghost,
    activeStep: PROFESSIONAL_COLORS.keyStaff.blue,
    completedStep: PROFESSIONAL_COLORS.accents.forestGreen,
    border: PROFESSIONAL_COLORS.accents.steel,
    text: PROFESSIONAL_COLORS.text.primary,
    accent: PROFESSIONAL_COLORS.keyStaff.orange,
  },
  
  controls: {
    background: PROFESSIONAL_COLORS.background.secondary,
    surface: PROFESSIONAL_COLORS.background.tertiary,
    border: PROFESSIONAL_COLORS.accents.charcoal,
    text: PROFESSIONAL_COLORS.text.inverted,
    accent: PROFESSIONAL_COLORS.accents.deepGreen,
    hover: PROFESSIONAL_COLORS.states.hover,
  }
};

export default PROFESSIONAL_COLORS;