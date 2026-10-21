// Space-separated RGB values allow Tailwind opacity modifiers in both themes.
export const experienceColors = {
  background: 'bg',
  surface: { DEFAULT: 'surface', dim: 'surface', bright: 'highest', lowest: 'lowest', low: 'low', container: 'container', high: 'high', highest: 'highest', card: 'card', elevated: 'high', border: 'border' },
  primary: { DEFAULT: 'primary', light: 'primary-light', dim: 'primary', container: 'primary-container', fixed: 'primary-light', 'fixed-dim': 'primary-light', 'on-container': 'ink' },
  outline: { DEFAULT: 'muted', variant: 'border', subtle: 'border' },
  'outline-variant': 'border',
  'surface-container-lowest': 'lowest', 'surface-container-low': 'low', 'surface-container': 'container',
  'surface-container-high': 'high', 'surface-container-highest': 'highest', 'surface-variant': 'highest',
  'on-surface': 'ink', 'on-surface-variant': 'secondary-ink', 'on-primary': 'on-primary',
  white: 'white',
  slate: { 100: 'slate-100', 200: 'slate-200', 300: 'slate-300', 400: 'slate-400' },
};

export function colorVariables(value) {
  return typeof value === 'string'
    ? `rgb(var(--lv-${value}) / <alpha-value>)`
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, colorVariables(entry)]));
}
