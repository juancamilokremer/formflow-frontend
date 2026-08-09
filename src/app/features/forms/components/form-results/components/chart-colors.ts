// Colors for the "Per question" charts. FormFlow has no validated categorical ramp
// of its own (only semantic tokens in styles.scss), so categorical series use the
// dataviz skill's validated reference palette (fixed order, never reordered by
// value). The semantic ones DO mirror the --ff-primary/success/warning/error tokens
// in styles.scss — keep them in sync manually, ApexCharts can't resolve CSS custom
// properties when building chart options.

export const CATEGORICAL_PALETTE: string[] = [
  '#2a78d6', // azul
  '#eb6834', // naranja
  '#1baf7a', // aqua
  '#eda100', // amarillo
  '#e87ba4', // magenta
  '#008300', // verde
];

// Single-hue sequential ramp (blue), light→dark steps, for the MATRIX heatmap.
export const SEQUENTIAL_BLUE_STEPS: { threshold: number; color: string }[] = [
  { threshold: 20, color: '#cde2fb' },
  { threshold: 40, color: '#9ec5f4' },
  { threshold: 60, color: '#5598e7' },
  { threshold: 80, color: '#2a78d6' },
  { threshold: 100, color: '#184f95' },
];

export const FORMFLOW_PRIMARY = '#4F46E5';
export const FORMFLOW_SUCCESS = '#15803D';
export const FORMFLOW_WARNING = '#854D0E';
export const FORMFLOW_ERROR = '#EF4444';
