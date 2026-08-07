// Colores para las gráficas de "Por pregunta". FormFlow no tiene una rampa
// categórica propia validada (solo tokens semánticos en styles.scss), así que las
// series categóricas usan la paleta de referencia ya validada de la skill dataviz
// (orden fijo, nunca reordenada por valor). Los semánticos SI reflejan los tokens
// --ff-primary/success/warning/error de styles.scss — mantener en sync manualmente,
// ApexCharts no puede resolver custom properties CSS al construir las opciones.

export const CATEGORICAL_PALETTE: string[] = [
  '#2a78d6', // azul
  '#eb6834', // naranja
  '#1baf7a', // aqua
  '#eda100', // amarillo
  '#e87ba4', // magenta
  '#008300', // verde
];

// Rampa secuencial de un solo hue (azul), pasos claro→oscuro, para el heatmap de MATRIX.
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
