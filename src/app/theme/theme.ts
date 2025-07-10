const colors = {
  primary: '#2ecc71',
  primaryDark: '#27ae60',
  secondary: '#3498db',
  secondaryDark: '#2980b9',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  success: '#2ecc71',
  
  background: {
    primary: '#f9fafb',
    secondary: '#f1f2f6',
    elevated: '#ffffff',
  },
  
  surface: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    elevated: '#ffffff',
  },
  
  text: {
    primary: '#2d3436',
    secondary: '#636e72',
    tertiary: '#b2bec3',
    inverse: '#ffffff',
  },
  
  effects: {
    shadow: {
      light: {
        color: '#000000',
        offset: { width: 0, height: 1 },
        opacity: 0.05,
        radius: 2,
      },
      medium: {
        color: '#000000',
        offset: { width: 0, height: 2 },
        opacity: 0.1,
        radius: 4,
      },
      heavy: {
        color: '#000000',
        offset: { width: 0, height: 4 },
        opacity: 0.15,
        radius: 8,
      },
    },
    glass: {
      borderColor: '#e6e6e6',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
};