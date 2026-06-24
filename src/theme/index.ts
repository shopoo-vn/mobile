// Minimal design tokens shared across screens.
export const colors = {
  bg: '#ffffff',
  surface: '#f5f6f8',
  border: '#e2e5ea',
  text: '#15181e',
  textMuted: '#6b7280',
  primary: '#1f6feb',
  primaryText: '#ffffff',
  danger: '#d92d20',
  success: '#067647',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export function formatVnd(value: number): string {
  return `${value.toLocaleString('vi-VN')} ₫`;
}
